import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 테스트 전 데이터 정리
    await prisma.reviewImage.deleteMany();
    await prisma.review.deleteMany();
    await prisma.dateRecord.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.coupleInvite.deleteMany();
    await prisma.couple.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('/auth', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: '테스트',
    };

    describe('POST /auth/register', () => {
      it('회원가입 성공', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(201);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user.email).toBe(registerDto.email);
      });

      it('중복 이메일 회원가입 실패', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto);

        await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(409);
      });

      it('유효성 검증 실패', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'invalid', password: '123', name: '' })
          .expect(400);
      });
    });

    describe('POST /auth/login', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto);
      });

      it('로그인 성공', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: registerDto.email,
            password: registerDto.password,
          })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
      });

      it('잘못된 비밀번호로 로그인 실패', async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: registerDto.email,
            password: 'wrongpassword',
          })
          .expect(401);
      });

      it('존재하지 않는 이메일로 로그인 실패', async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'notexist@example.com',
            password: 'password123',
          })
          .expect(401);
      });
    });
  });

  describe('/users', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: '테스트',
        });
      accessToken = response.body.accessToken;
    });

    describe('GET /users/me', () => {
      it('현재 사용자 정보 조회', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.email).toBe('test@example.com');
      });

      it('인증 없이 접근 실패', async () => {
        await request(app.getHttpServer()).get('/users/me').expect(401);
      });
    });

    describe('PATCH /users/me', () => {
      it('사용자 정보 수정', async () => {
        const response = await request(app.getHttpServer())
          .patch('/users/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: '새이름' })
          .expect(200);

        expect(response.body.name).toBe('새이름');
      });
    });
  });

  describe('/couples', () => {
    let accessToken1: string;
    let accessToken2: string;

    beforeEach(async () => {
      const res1 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user1@example.com',
          password: 'password123',
          name: 'User1',
        });
      accessToken1 = res1.body.accessToken;

      const res2 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user2@example.com',
          password: 'password123',
          name: 'User2',
        });
      accessToken2 = res2.body.accessToken;
    });

    describe('POST /couples/invite', () => {
      it('초대 코드 생성', async () => {
        const response = await request(app.getHttpServer())
          .post('/couples/invite')
          .set('Authorization', `Bearer ${accessToken1}`)
          .send({ coupleName: '우리커플' })
          .expect(201);

        expect(response.body).toHaveProperty('inviteCode');
        expect(response.body.inviteCode).toHaveLength(8);
      });
    });

    describe('POST /couples/accept', () => {
      it('초대 수락 및 커플 생성', async () => {
        const inviteRes = await request(app.getHttpServer())
          .post('/couples/invite')
          .set('Authorization', `Bearer ${accessToken1}`)
          .send({ coupleName: '우리커플' });

        const response = await request(app.getHttpServer())
          .post('/couples/accept')
          .set('Authorization', `Bearer ${accessToken2}`)
          .send({ inviteCode: inviteRes.body.inviteCode })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('우리커플');
      });

      it('잘못된 초대 코드로 실패', async () => {
        await request(app.getHttpServer())
          .post('/couples/accept')
          .set('Authorization', `Bearer ${accessToken2}`)
          .send({ inviteCode: 'INVALID1' })
          .expect(404);
      });
    });
  });

  describe('/restaurants', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: '테스트',
        });
      accessToken = response.body.accessToken;
    });

    describe('POST /restaurants', () => {
      it('식당 생성', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: '맛집',
            address: '서울시 강남구',
            category: '한식',
          })
          .expect(201);

        expect(response.body.name).toBe('맛집');
      });
    });

    describe('GET /restaurants/search', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: '맛집', category: '한식' });
      });

      it('식당 검색', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/search')
          .set('Authorization', `Bearer ${accessToken}`)
          .query({ q: '맛집' })
          .expect(200);

        expect(response.body).toHaveLength(1);
      });
    });
  });
});

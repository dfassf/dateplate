import { CanActivate, ExecutionContext, Injectable, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller.js';
import { AuthService } from '../src/auth/auth.service.js';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard.js';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter.js';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor.js';
import { TeamsController } from '../src/teams/teams.controller.js';
import { TeamsService } from '../src/teams/teams.service.js';

@Injectable()
class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requestRef = context.switchToHttp().getRequest<{ user?: { id: string; email: string; name: string } }>();
    requestRef.user = {
      id: 'user-1',
      email: 'user1@example.com',
      name: 'User One',
    };
    return true;
  }
}

describe('Controllers (e2e)', () => {
  let app: INestApplication;

  const authServiceMock = {
    checkEmail: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
  };

  const teamsServiceMock = {
    create: jest.fn(),
    getMyTeams: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeMember: jest.fn(),
    createInvite: jest.fn(),
    acceptInvite: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, TeamsController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: TeamsService, useValue: teamsServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register should validate and pass parsed dto to service', async () => {
    authServiceMock.register.mockResolvedValue({
      accessToken: 'token-1',
      user: { id: 'user-1', email: 'user1@example.com', name: 'User One' },
    });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user1@example.com',
        password: '123456',
        name: 'User One',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          data: {
            accessToken: 'token-1',
            user: { id: 'user-1', email: 'user1@example.com', name: 'User One' },
          },
        });
      });

    expect(authServiceMock.register).toHaveBeenCalledWith('user1@example.com', '123456', 'User One');
  });

  it('POST /auth/register should return 400 for invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email', password: '123456', name: 'User One' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.data).toBeNull();
        expect(body.statusCode).toBe(400);
        expect(body.path).toBe('/auth/register');
        expect(typeof body.message).toBe('string');
      });

    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('POST /teams should use current user and return wrapped data', async () => {
    teamsServiceMock.create.mockResolvedValue({ id: 'team-1', name: 'Backend Team' });

    await request(app.getHttpServer())
      .post('/teams')
      .send({ name: 'Backend Team' })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          data: { id: 'team-1', name: 'Backend Team' },
        });
      });

    expect(teamsServiceMock.create).toHaveBeenCalledWith('user-1', 'Backend Team');
  });

  it('POST /teams should return 400 when name is too short', async () => {
    await request(app.getHttpServer())
      .post('/teams')
      .send({ name: 'A' })
      .expect(400);

    expect(teamsServiceMock.create).not.toHaveBeenCalled();
  });

  it('POST /teams/join should validate payload and call service', async () => {
    teamsServiceMock.acceptInvite.mockResolvedValue({ id: 'team-2', name: 'Joined Team' });

    await request(app.getHttpServer())
      .post('/teams/join')
      .send({ inviteCode: 'ABC123' })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({ data: { id: 'team-2', name: 'Joined Team' } });
      });

    expect(teamsServiceMock.acceptInvite).toHaveBeenCalledWith('user-1', 'ABC123');
  });

  it('POST /teams/join should return 400 when inviteCode is missing', async () => {
    await request(app.getHttpServer())
      .post('/teams/join')
      .send({})
      .expect(400);

    expect(teamsServiceMock.acceptInvite).not.toHaveBeenCalled();
  });
});

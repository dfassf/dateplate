import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: '테스트',
    };

    it('새 사용자를 등록해야 한다', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        email: registerDto.email,
        name: registerDto.name,
        password: 'hashed',
      });
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        user: {
          id: 'user-id',
          email: registerDto.email,
          name: registerDto.name,
        },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('이미 등록된 이메일이면 ConflictException을 던져야 한다', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('올바른 자격 증명으로 로그인해야 한다', async () => {
      const hashedPassword = await argon2.hash(loginDto.password);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        name: '테스트',
        password: hashedPassword,
      });
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        user: {
          id: 'user-id',
          email: loginDto.email,
          name: '테스트',
        },
      });
    });

    it('존재하지 않는 이메일이면 UnauthorizedException을 던져야 한다', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('비밀번호가 틀리면 UnauthorizedException을 던져야 한다', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        password: await argon2.hash('different-password'),
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('유효한 사용자 ID로 사용자를 반환해야 한다', async () => {
      const user = { id: 'user-id', email: 'test@example.com', name: '테스트' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser('user-id');

      expect(result).toEqual(user);
    });

    it('존재하지 않는 사용자 ID면 UnauthorizedException을 던져야 한다', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('invalid-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

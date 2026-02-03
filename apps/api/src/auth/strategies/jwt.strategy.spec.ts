import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('유효한 사용자를 반환해야 한다', async () => {
      const user = { id: 'user-id', email: 'test@example.com', name: '테스트' };
      mockAuthService.validateUser.mockResolvedValue(user);

      const result = await strategy.validate({ sub: 'user-id' });

      expect(result).toEqual(user);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('user-id');
    });

    it('사용자가 없으면 UnauthorizedException을 던져야 한다', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate({ sub: 'invalid-id' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

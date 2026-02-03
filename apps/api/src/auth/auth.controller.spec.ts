import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('회원가입을 처리해야 한다', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: '테스트',
      };
      const result = {
        accessToken: 'token',
        user: { id: 'user-id', email: dto.email, name: dto.name },
      };
      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(dto)).toEqual(result);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('로그인을 처리해야 한다', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const result = {
        accessToken: 'token',
        user: { id: 'user-id', email: dto.email, name: '테스트' },
      };
      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(dto)).toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findById: jest.fn(),
    update: jest.fn(),
    getMyCouple: jest.fn(),
  };

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: '테스트',
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('현재 사용자 정보를 반환해야 한다', async () => {
      const userInfo = {
        id: 'user-id',
        email: 'test@example.com',
        name: '테스트',
      };
      mockUsersService.findById.mockResolvedValue(userInfo);

      const result = await controller.getMe(mockUser as any);

      expect(result).toEqual(userInfo);
      expect(mockUsersService.findById).toHaveBeenCalledWith('user-id');
    });
  });

  describe('updateMe', () => {
    it('현재 사용자 정보를 업데이트해야 한다', async () => {
      const dto = { name: '새이름' };
      const updatedUser = { ...mockUser, name: '새이름' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(mockUser as any, dto);

      expect(result.name).toBe('새이름');
      expect(mockUsersService.update).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('getMyCouple', () => {
    it('커플 정보를 반환해야 한다', async () => {
      const couple = { id: 'couple-id' };
      mockUsersService.getMyCouple.mockResolvedValue(couple);

      const result = await controller.getMyCouple(mockUser as any);

      expect(result).toEqual(couple);
      expect(mockUsersService.getMyCouple).toHaveBeenCalledWith('user-id');
    });
  });
});

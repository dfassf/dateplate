import { Test, TestingModule } from '@nestjs/testing';
import { CouplesController } from './couples.controller';
import { CouplesService } from './couples.service';

describe('CouplesController', () => {
  let controller: CouplesController;

  const mockCouplesService = {
    createInvite: jest.fn(),
    acceptInvite: jest.fn(),
    getMyCouple: jest.fn(),
    getMyPendingInvite: jest.fn(),
    updateCouple: jest.fn(),
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
      controllers: [CouplesController],
      providers: [{ provide: CouplesService, useValue: mockCouplesService }],
    }).compile();

    controller = module.get<CouplesController>(CouplesController);
    jest.clearAllMocks();
  });

  describe('createInvite', () => {
    it('초대 코드를 생성해야 한다', async () => {
      const dto = { coupleName: '우리커플' };
      const result = { inviteCode: 'ABCD1234', expiresAt: new Date() };
      mockCouplesService.createInvite.mockResolvedValue(result);

      expect(await controller.createInvite(mockUser as any, dto)).toEqual(result);
      expect(mockCouplesService.createInvite).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('acceptInvite', () => {
    it('초대를 수락해야 한다', async () => {
      const dto = { inviteCode: 'ABCD1234' };
      const result = { id: 'couple-id' };
      mockCouplesService.acceptInvite.mockResolvedValue(result);

      expect(await controller.acceptInvite(mockUser as any, dto)).toEqual(result);
      expect(mockCouplesService.acceptInvite).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('getMyCouple', () => {
    it('커플 정보를 반환해야 한다', async () => {
      const result = { id: 'couple-id' };
      mockCouplesService.getMyCouple.mockResolvedValue(result);

      expect(await controller.getMyCouple(mockUser as any)).toEqual(result);
      expect(mockCouplesService.getMyCouple).toHaveBeenCalledWith('user-id');
    });
  });

  describe('getMyPendingInvite', () => {
    it('대기 중인 초대를 반환해야 한다', async () => {
      const result = { inviteCode: 'ABCD1234' };
      mockCouplesService.getMyPendingInvite.mockResolvedValue(result);

      expect(await controller.getMyPendingInvite(mockUser as any)).toEqual(result);
      expect(mockCouplesService.getMyPendingInvite).toHaveBeenCalledWith('user-id');
    });
  });

  describe('updateCouple', () => {
    it('커플 정보를 업데이트해야 한다', async () => {
      const dto = { name: '새커플이름' };
      const result = { id: 'couple-id', name: '새커플이름' };
      mockCouplesService.updateCouple.mockResolvedValue(result);

      expect(await controller.updateCouple(mockUser as any, 'couple-id', dto)).toEqual(result);
      expect(mockCouplesService.updateCouple).toHaveBeenCalledWith('user-id', 'couple-id', dto);
    });
  });
});

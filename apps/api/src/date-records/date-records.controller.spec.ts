import { Test, TestingModule } from '@nestjs/testing';
import { DateRecordsController } from './date-records.controller';
import { DateRecordsService } from './date-records.service';

describe('DateRecordsController', () => {
  let controller: DateRecordsController;

  const mockDateRecordsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
      controllers: [DateRecordsController],
      providers: [
        { provide: DateRecordsService, useValue: mockDateRecordsService },
      ],
    }).compile();

    controller = module.get<DateRecordsController>(DateRecordsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('데이트 기록을 생성해야 한다', async () => {
      const dto = {
        date: '2024-01-15',
        restaurantId: 'restaurant-id',
        memo: '맛있었다',
      };
      const result = { id: 'record-id', ...dto };
      mockDateRecordsService.create.mockResolvedValue(result);

      expect(await controller.create(mockUser as any, dto)).toEqual(result);
      expect(mockDateRecordsService.create).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('findAll', () => {
    it('데이트 기록 목록을 반환해야 한다', async () => {
      const result = { data: [], total: 0, page: 1, limit: 20 };
      mockDateRecordsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(mockUser as any, '1', '20')).toEqual(result);
      expect(mockDateRecordsService.findAll).toHaveBeenCalledWith('user-id', 1, 20);
    });

    it('페이지네이션 기본값을 사용해야 한다', async () => {
      mockDateRecordsService.findAll.mockResolvedValue({ data: [] });

      await controller.findAll(mockUser as any, undefined, undefined);

      expect(mockDateRecordsService.findAll).toHaveBeenCalledWith('user-id', 1, 20);
    });
  });

  describe('findById', () => {
    it('데이트 기록을 반환해야 한다', async () => {
      const result = { id: 'record-id' };
      mockDateRecordsService.findById.mockResolvedValue(result);

      expect(await controller.findById(mockUser as any, 'record-id')).toEqual(result);
      expect(mockDateRecordsService.findById).toHaveBeenCalledWith('user-id', 'record-id');
    });
  });

  describe('update', () => {
    it('데이트 기록을 업데이트해야 한다', async () => {
      const dto = { memo: '새메모' };
      const result = { id: 'record-id', memo: '새메모' };
      mockDateRecordsService.update.mockResolvedValue(result);

      expect(await controller.update(mockUser as any, 'record-id', dto)).toEqual(result);
      expect(mockDateRecordsService.update).toHaveBeenCalledWith('user-id', 'record-id', dto);
    });
  });

  describe('delete', () => {
    it('데이트 기록을 삭제해야 한다', async () => {
      const result = { success: true };
      mockDateRecordsService.delete.mockResolvedValue(result);

      expect(await controller.delete(mockUser as any, 'record-id')).toEqual(result);
      expect(mockDateRecordsService.delete).toHaveBeenCalledWith('user-id', 'record-id');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DateRecordsService } from './date-records.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DateRecordsService', () => {
  let service: DateRecordsService;

  const mockPrismaService = {
    couple: {
      findFirst: jest.fn(),
    },
    restaurant: {
      findUnique: jest.fn(),
    },
    dateRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockCouple = { id: 'couple-id', user1Id: 'user-1', user2Id: 'user-2' };
  const mockRestaurant = { id: 'restaurant-id', name: '맛집' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DateRecordsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DateRecordsService>(DateRecordsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      date: '2024-01-15',
      restaurantId: 'restaurant-id',
      memo: '맛있었다',
      amount: 50000,
    };

    it('데이트 기록을 생성해야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrismaService.dateRecord.create.mockResolvedValue({
        id: 'record-id',
        ...dto,
        date: new Date(dto.date),
        coupleId: mockCouple.id,
        restaurant: mockRestaurant,
      });

      const result = await service.create('user-1', dto);

      expect(result).toHaveProperty('id');
      expect(result.restaurant).toEqual(mockRestaurant);
    });

    it('커플이 아니면 BadRequestException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(null);

      await expect(service.create('user-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('존재하지 않는 식당이면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('커플의 데이트 기록 목록을 반환해야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.dateRecord.findMany.mockResolvedValue([
        { id: 'record-1' },
        { id: 'record-2' },
      ]);
      mockPrismaService.dateRecord.count.mockResolvedValue(2);

      const result = await service.findAll('user-1', 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('커플이 아니면 빈 배열을 반환해야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(null);

      const result = await service.findAll('user-1', 1, 20);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findById', () => {
    it('데이트 기록을 반환해야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.dateRecord.findUnique.mockResolvedValue({
        id: 'record-id',
        coupleId: mockCouple.id,
      });

      const result = await service.findById('user-1', 'record-id');

      expect(result).toHaveProperty('id', 'record-id');
    });

    it('존재하지 않는 기록이면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.dateRecord.findUnique.mockResolvedValue(null);

      await expect(service.findById('user-1', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('다른 커플의 기록이면 ForbiddenException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.dateRecord.findUnique.mockResolvedValue({
        id: 'record-id',
        coupleId: 'other-couple-id',
      });

      await expect(service.findById('user-1', 'record-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('데이트 기록을 삭제해야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.dateRecord.findUnique.mockResolvedValue({
        id: 'record-id',
        coupleId: mockCouple.id,
      });
      mockPrismaService.dateRecord.delete.mockResolvedValue({});

      const result = await service.delete('user-1', 'record-id');

      expect(result).toEqual({ success: true });
    });
  });
});

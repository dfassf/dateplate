import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    couple: {
      findFirst: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: '테스트',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('사용자를 반환해야 한다', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-id');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('존재하지 않는 사용자면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('사용자 정보를 업데이트해야 한다', async () => {
      const updatedUser = { ...mockUser, name: '새이름' };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-id', { name: '새이름' });

      expect(result.name).toBe('새이름');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { name: '새이름' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('getMyCouple', () => {
    it('커플 정보를 반환해야 한다', async () => {
      const mockCouple = {
        id: 'couple-id',
        user1: { id: 'user-1', email: 'user1@test.com', name: 'User1' },
        user2: { id: 'user-2', email: 'user2@test.com', name: 'User2' },
      };
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);

      const result = await service.getMyCouple('user-1');

      expect(result).toEqual(mockCouple);
      expect(mockPrismaService.couple.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ user1Id: 'user-1' }, { user2Id: 'user-1' }],
        },
        include: {
          user1: {
            select: { id: true, email: true, name: true },
          },
          user2: {
            select: { id: true, email: true, name: true },
          },
        },
      });
    });

    it('커플이 없으면 null을 반환해야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(null);

      const result = await service.getMyCouple('user-1');

      expect(result).toBeNull();
    });
  });
});

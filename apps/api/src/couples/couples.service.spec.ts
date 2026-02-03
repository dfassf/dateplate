import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CoupleInviteStatus } from '@prisma/client';
import { CouplesService } from './couples.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CouplesService', () => {
  let service: CouplesService;

  const mockPrismaService = {
    couple: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    coupleInvite: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouplesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CouplesService>(CouplesService);
    jest.clearAllMocks();
  });

  describe('createInvite', () => {
    it('초대 코드를 생성해야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(null);
      mockPrismaService.coupleInvite.updateMany.mockResolvedValue({ count: 0 });
      mockPrismaService.coupleInvite.create.mockResolvedValue({
        inviteCode: 'ABCD1234',
        expiresAt: new Date(),
      });

      const result = await service.createInvite('user-id', {});

      expect(result).toHaveProperty('inviteCode');
      expect(result).toHaveProperty('expiresAt');
      expect(mockPrismaService.coupleInvite.create).toHaveBeenCalled();
    });

    it('이미 커플이면 BadRequestException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue({
        id: 'couple-id',
      });

      await expect(service.createInvite('user-id', {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('acceptInvite', () => {
    const userId = 'user-2';
    const dto = { inviteCode: 'ABCD1234' };

    it('초대를 수락하고 커플을 생성해야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(null);
      mockPrismaService.coupleInvite.findFirst.mockResolvedValue({
        id: 'invite-id',
        inviteCode: 'ABCD1234',
        inviterId: 'user-1',
        status: CoupleInviteStatus.PENDING,
        expiresAt: new Date(Date.now() + 86400000),
      });

      const mockCouple = {
        id: 'couple-id',
        user1: { id: 'user-1', email: 'user1@test.com', name: 'User1' },
        user2: { id: 'user-2', email: 'user2@test.com', name: 'User2' },
      };
      mockPrismaService.$transaction.mockResolvedValue(mockCouple);

      const result = await service.acceptInvite(userId, dto);

      expect(result).toEqual(mockCouple);
    });

    it('이미 커플이면 BadRequestException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue({
        id: 'existing-couple',
      });

      await expect(service.acceptInvite(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('유효하지 않은 초대 코드면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(null);
      mockPrismaService.coupleInvite.findFirst.mockResolvedValue(null);

      await expect(service.acceptInvite(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('만료된 초대 코드면 BadRequestException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(null);
      mockPrismaService.coupleInvite.findFirst.mockResolvedValue({
        id: 'invite-id',
        inviterId: 'user-1',
        status: CoupleInviteStatus.PENDING,
        expiresAt: new Date(Date.now() - 86400000),
      });
      mockPrismaService.coupleInvite.update.mockResolvedValue({});

      await expect(service.acceptInvite(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('자기 자신의 초대 코드면 BadRequestException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(null);
      mockPrismaService.coupleInvite.findFirst.mockResolvedValue({
        id: 'invite-id',
        inviterId: userId,
        status: CoupleInviteStatus.PENDING,
        expiresAt: new Date(Date.now() + 86400000),
      });

      await expect(service.acceptInvite(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateCouple', () => {
    it('커플 정보를 업데이트해야 한다', async () => {
      mockPrismaService.couple.findUnique.mockResolvedValue({
        id: 'couple-id',
        user1Id: 'user-1',
        user2Id: 'user-2',
      });
      mockPrismaService.couple.update.mockResolvedValue({
        id: 'couple-id',
        name: '우리커플',
      });

      const result = await service.updateCouple('user-1', 'couple-id', {
        name: '우리커플',
      });

      expect(result.name).toBe('우리커플');
    });

    it('존재하지 않는 커플이면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.couple.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCouple('user-1', 'invalid-id', { name: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('커플 멤버가 아니면 ForbiddenException을 던져야 한다', async () => {
      mockPrismaService.couple.findUnique.mockResolvedValue({
        id: 'couple-id',
        user1Id: 'user-1',
        user2Id: 'user-2',
      });

      await expect(
        service.updateCouple('user-3', 'couple-id', { name: 'test' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

import { ConflictException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import { GamificationService } from './gamification.service.js';

describe('GamificationService', () => {
  const prismaMock = {
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    achievement: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    review: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    dinnerRecord: {
      count: jest.fn(),
    },
    mission: {
      findMany: jest.fn(),
    },
    missionProgress: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: GamificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GamificationService(prismaMock as unknown as PrismaService);
  });

  it('giveTicket should map unique constraint errors to ConflictException', async () => {
    prismaMock.ticket.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.giveTicket('from-user', {
        teamId: 'team-1',
        toUserId: 'to-user',
        type: 'GOLDEN',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('giveTicket should rethrow unknown errors', async () => {
    const dbError = new Error('database unavailable');
    prismaMock.ticket.create.mockRejectedValue(dbError);

    await expect(
      service.giveTicket('from-user', {
        teamId: 'team-1',
        toUserId: 'to-user',
        type: 'BLACK',
      }),
    ).rejects.toBe(dbError);
  });

  it('checkAndUnlockAchievements should upsert unlockable achievements in one transaction', async () => {
    prismaMock.review.count.mockResolvedValue(5);
    prismaMock.dinnerRecord.count.mockResolvedValue(10);
    prismaMock.review.findMany.mockResolvedValue([
      { restaurantId: 'r1' },
      { restaurantId: 'r2' },
      { restaurantId: 'r3' },
      { restaurantId: 'r4' },
      { restaurantId: 'r5' },
    ]);
    prismaMock.ticket.count.mockResolvedValue(1);
    prismaMock.achievement.upsert.mockResolvedValue({});
    prismaMock.$transaction.mockResolvedValue(undefined);
    prismaMock.achievement.findMany.mockResolvedValue([]);

    await service.checkAndUnlockAchievements('user-1');

    expect(prismaMock.achievement.upsert).toHaveBeenCalledTimes(6);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it('getAchievements should return unlocked flags by code', async () => {
    const unlockedAt = new Date('2026-01-01T00:00:00.000Z');
    prismaMock.achievement.findMany.mockResolvedValue([{ code: 'FIRST_REVIEW', unlockedAt }]);

    const achievements = await service.getAchievements('user-1');
    const firstReview = achievements.find((achievement) => achievement.code === 'FIRST_REVIEW');
    const review10 = achievements.find((achievement) => achievement.code === 'REVIEW_10');

    expect(firstReview).toEqual(
      expect.objectContaining({
        code: 'FIRST_REVIEW',
        unlocked: true,
        unlockedAt,
      }),
    );
    expect(review10).toEqual(
      expect.objectContaining({
        code: 'REVIEW_10',
        unlocked: false,
      }),
    );
  });
});

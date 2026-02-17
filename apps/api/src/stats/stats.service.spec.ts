import type { PrismaService } from '../prisma/prisma.service.js';
import { StatsService } from './stats.service.js';

describe('StatsService', () => {
  const prismaMock = {
    dinnerRecord: {
      aggregate: jest.fn(),
    },
    review: {
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    teamMember: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  let service: StatsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StatsService(prismaMock as unknown as PrismaService);
  });

  describe('getTeamStats', () => {
    it('returns team stats from aggregate/groupBy/raw query results', async () => {
      prismaMock.dinnerRecord.aggregate.mockResolvedValue({
        _count: { _all: 4 },
        _sum: { totalAmount: 180000, headcount: 12 },
      });
      prismaMock.review.aggregate.mockResolvedValue({
        _count: { _all: 5 },
        _avg: { rating: 4.2 },
      });
      prismaMock.teamMember.findMany.mockResolvedValue([
        { userId: 'u1', user: { name: 'Kim' } },
        { userId: 'u2', user: { name: 'Lee' } },
      ]);
      prismaMock.review.groupBy.mockResolvedValue([
        { authorId: 'u1', _count: { authorId: 3 } },
        { authorId: 'u2', _count: { authorId: 2 } },
      ]);
      prismaMock.$queryRaw
        .mockResolvedValueOnce([
          { month: '2026-01', amount: '50000', count: '1' },
          { month: '2026-02', amount: '130000', count: '3' },
        ])
        .mockResolvedValueOnce([
          { category: '한식', count: '3' },
          { category: '기타', count: '1' },
        ]);

      const result = await service.getTeamStats('team-1');

      expect(result).toEqual({
        totalDinners: 4,
        totalAmount: 180000,
        avgPerPerson: 15000,
        monthlySpending: [
          { month: '2026-01', amount: 50000, count: 1 },
          { month: '2026-02', amount: 130000, count: 3 },
        ],
        categoryDistribution: [
          { category: '한식', count: 3 },
          { category: '기타', count: 1 },
        ],
        memberParticipation: [
          { name: 'Kim', count: 3 },
          { name: 'Lee', count: 2 },
        ],
        totalReviews: 5,
        avgRating: 4.2,
      });

      expect(prismaMock.dinnerRecord.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { teamId: 'team-1' } }),
      );
      expect(prismaMock.review.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ by: ['authorId'], where: { teamId: 'team-1' } }),
      );
      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(2);
    });

    it('handles nullable aggregates and bigint query results safely', async () => {
      prismaMock.dinnerRecord.aggregate.mockResolvedValue({
        _count: { _all: 0 },
        _sum: { totalAmount: null, headcount: null },
      });
      prismaMock.review.aggregate.mockResolvedValue({
        _count: { _all: 0 },
        _avg: { rating: null },
      });
      prismaMock.teamMember.findMany.mockResolvedValue([{ userId: 'u1', user: { name: 'Kim' } }]);
      prismaMock.review.groupBy.mockResolvedValue([]);
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ month: '2026-02', amount: 0n, count: 0n }])
        .mockResolvedValueOnce([{ category: null, count: 0n }]);

      const result = await service.getTeamStats('team-1');

      expect(result).toEqual({
        totalDinners: 0,
        totalAmount: 0,
        avgPerPerson: 0,
        monthlySpending: [{ month: '2026-02', amount: 0, count: 0 }],
        categoryDistribution: [{ category: '기타', count: 0 }],
        memberParticipation: [{ name: 'Kim', count: 0 }],
        totalReviews: 0,
        avgRating: 0,
      });
    });
  });
});

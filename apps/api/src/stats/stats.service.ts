import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type NumericLike = number | string | bigint | null | undefined;

type MonthlySpendingRow = {
  month: string;
  amount: NumericLike;
  count: NumericLike;
};

type CategoryDistributionRow = {
  category: string | null;
  count: NumericLike;
};

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  private toNumber(value: NumericLike): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value);
    if (typeof value === 'bigint') return Number(value);
    return 0;
  }

  async getTeamStats(teamId: string) {
    // Prisma aggregate/groupBy + raw SQL 집계를 이용해 대량 데이터 로딩을 피한다.
    const [dinnerSummary, reviewSummary, members, reviewCountByAuthor, monthlyRows, categoryRows] =
      await Promise.all([
        this.prisma.dinnerRecord.aggregate({
          where: { teamId },
          _count: { _all: true },
          _sum: { totalAmount: true, headcount: true },
        }),
        this.prisma.review.aggregate({
          where: { teamId },
          _count: { _all: true },
          _avg: { rating: true },
        }),
        this.prisma.teamMember.findMany({
          where: { teamId },
          select: {
            userId: true,
            user: {
              select: { name: true },
            },
          },
        }),
        this.prisma.review.groupBy({
          by: ['authorId'],
          where: { teamId },
          _count: { authorId: true },
        }),
        this.prisma.$queryRaw<MonthlySpendingRow[]>`
          SELECT
            TO_CHAR(DATE_TRUNC('month', "date"), 'YYYY-MM') AS "month",
            COALESCE(SUM("totalAmount"), 0)::bigint AS "amount",
            COUNT(*)::bigint AS "count"
          FROM "DinnerRecord"
          WHERE "teamId" = ${teamId}
          GROUP BY DATE_TRUNC('month', "date")
          ORDER BY DATE_TRUNC('month', "date") ASC
        `,
        this.prisma.$queryRaw<CategoryDistributionRow[]>`
          SELECT
            COALESCE(r."category", '기타') AS "category",
            COUNT(*)::bigint AS "count"
          FROM "DinnerRecord" d
          LEFT JOIN "Restaurant" r ON r."id" = d."restaurantId"
          WHERE d."teamId" = ${teamId}
          GROUP BY COALESCE(r."category", '기타')
          ORDER BY COUNT(*) DESC
        `,
      ]);

    const memberReviewCount: Record<string, { name: string; count: number }> = {};
    members.forEach((member) => {
      memberReviewCount[member.userId] = { name: member.user.name, count: 0 };
    });
    reviewCountByAuthor.forEach((row) => {
      if (memberReviewCount[row.authorId]) {
        memberReviewCount[row.authorId].count = row._count.authorId;
      }
    });

    const totalDinners = dinnerSummary._count._all;
    const totalAmount = this.toNumber(dinnerSummary._sum.totalAmount);
    const totalHeadcount = this.toNumber(dinnerSummary._sum.headcount);
    const totalReviews = reviewSummary._count._all;
    const avgRating = reviewSummary._avg.rating ?? 0;

    return {
      totalDinners,
      totalAmount,
      avgPerPerson: totalHeadcount > 0 ? Math.round(totalAmount / totalHeadcount) : 0,
      monthlySpending: monthlyRows.map((row) => ({
        month: row.month,
        amount: this.toNumber(row.amount),
        count: this.toNumber(row.count),
      })),
      categoryDistribution: categoryRows.map((row) => ({
        category: row.category ?? '기타',
        count: this.toNumber(row.count),
      })),
      memberParticipation: Object.values(memberReviewCount).sort((a, b) => b.count - a.count),
      totalReviews,
      avgRating,
    };
  }
}

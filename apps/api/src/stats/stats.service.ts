import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { calcAvgRating } from '../common/utils/rating.js';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getTeamStats(teamId: string) {
    const [dinners, reviews, members] = await Promise.all([
      this.prisma.dinnerRecord.findMany({
        where: { teamId },
        include: { restaurant: true },
        orderBy: { date: 'asc' },
      }),
      this.prisma.review.findMany({
        where: { teamId },
        include: { author: { omit: { password: true } }, restaurant: true },
      }),
      this.prisma.teamMember.findMany({
        where: { teamId },
        include: { user: { omit: { password: true } } },
      }),
    ]);

    // 월별 지출
    const monthlySpending: Record<string, number> = {};
    const monthlyCount: Record<string, number> = {};
    dinners.forEach((d) => {
      const date = new Date(d.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlySpending[key] = (monthlySpending[key] || 0) + (d.totalAmount || 0);
      monthlyCount[key] = (monthlyCount[key] || 0) + 1;
    });

    // 카테고리 분포
    const categoryCount: Record<string, number> = {};
    dinners.forEach((d) => {
      const cat = d.restaurant?.category || '기타';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    // 멤버별 리뷰 수
    const memberReviewCount: Record<string, { name: string; count: number }> = {};
    members.forEach((m) => {
      memberReviewCount[m.userId] = { name: m.user.name, count: 0 };
    });
    reviews.forEach((r) => {
      if (memberReviewCount[r.authorId]) {
        memberReviewCount[r.authorId].count++;
      }
    });

    // 인당 평균
    const totalAmount = dinners.reduce((s, d) => s + (d.totalAmount || 0), 0);
    const totalHeadcount = dinners.reduce((s, d) => s + (d.headcount || 0), 0);

    return {
      totalDinners: dinners.length,
      totalAmount,
      avgPerPerson: totalHeadcount > 0 ? Math.round(totalAmount / totalHeadcount) : 0,
      monthlySpending: Object.entries(monthlySpending)
        .map(([month, amount]) => ({ month, amount, count: monthlyCount[month] || 0 }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      categoryDistribution: Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
      memberParticipation: Object.values(memberReviewCount)
        .sort((a, b) => b.count - a.count),
      totalReviews: reviews.length,
      avgRating: calcAvgRating(reviews),
    };
  }
}

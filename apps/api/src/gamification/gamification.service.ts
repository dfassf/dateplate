import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GiveTicketDto } from './dto/index.js';

const ACHIEVEMENT_DEFS = [
  { code: 'FIRST_REVIEW', title: '첫 리뷰', description: '첫 번째 리뷰를 작성했습니다' },
  { code: 'REVIEW_5', title: '리뷰 5개', description: '리뷰 5개를 작성했습니다' },
  { code: 'REVIEW_10', title: '리뷰 마스터', description: '리뷰 10개를 작성했습니다' },
  { code: 'DINNER_5', title: '회식 5회', description: '회식 5회에 참여했습니다' },
  { code: 'DINNER_10', title: '회식 베테랑', description: '회식 10회에 참여했습니다' },
  { code: 'RESTAURANT_5', title: '미식 탐험가', description: '5곳의 다른 식당을 방문했습니다' },
  { code: 'GOLDEN_TICKET', title: '골든 티켓 수령', description: '첫 번째 황금 티켓을 받았습니다' },
];

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  // 티켓
  async giveTicket(fromUserId: string, dto: GiveTicketDto) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      return await this.prisma.ticket.create({
        data: {
          type: dto.type,
          teamId: dto.teamId,
          fromUserId,
          toUserId: dto.toUserId,
          month,
          year,
        },
      });
    } catch {
      throw new ConflictException('이번 달에 이미 이 팀원에게 티켓을 줬습니다');
    }
  }

  async getTicketResults(teamId: string, month?: number, year?: number) {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();

    const tickets = await this.prisma.ticket.findMany({
      where: { teamId, month: m, year: y },
    });

    // 유저별 집계
    const userStats: Record<string, { golden: number; black: number }> = {};
    tickets.forEach((t) => {
      if (!userStats[t.toUserId]) userStats[t.toUserId] = { golden: 0, black: 0 };
      if (t.type === 'GOLDEN') userStats[t.toUserId].golden++;
      else userStats[t.toUserId].black++;
    });

    return { month: m, year: y, results: userStats };
  }

  // 업적
  async getAchievements(userId: string) {
    const unlocked = await this.prisma.achievement.findMany({ where: { userId } });
    const unlockedCodes = new Set(unlocked.map((a) => a.code));
    return ACHIEVEMENT_DEFS.map((def) => ({
      ...def,
      unlocked: unlockedCodes.has(def.code),
      unlockedAt: unlocked.find((a) => a.code === def.code)?.unlockedAt,
    }));
  }

  async checkAndUnlockAchievements(userId: string) {
    const [reviewCount, dinnerCount, restaurantCount, goldenTicketCount] = await Promise.all([
      this.prisma.review.count({ where: { authorId: userId } }),
      this.prisma.dinnerRecord.count({ where: { creator: { id: userId } } }),
      this.prisma.review.findMany({
        where: { authorId: userId },
        select: { restaurantId: true },
        distinct: ['restaurantId'],
      }).then((r) => r.length),
      this.prisma.ticket.count({ where: { toUserId: userId, type: 'GOLDEN' } }),
    ]);

    const toUnlock: string[] = [];
    if (reviewCount >= 1) toUnlock.push('FIRST_REVIEW');
    if (reviewCount >= 5) toUnlock.push('REVIEW_5');
    if (reviewCount >= 10) toUnlock.push('REVIEW_10');
    if (dinnerCount >= 5) toUnlock.push('DINNER_5');
    if (dinnerCount >= 10) toUnlock.push('DINNER_10');
    if (restaurantCount >= 5) toUnlock.push('RESTAURANT_5');
    if (goldenTicketCount >= 1) toUnlock.push('GOLDEN_TICKET');

    for (const code of toUnlock) {
      await this.prisma.achievement.upsert({
        where: { userId_code: { userId, code } },
        create: { userId, code },
        update: {},
      });
    }

    return this.getAchievements(userId);
  }

  // 미션
  async getMissions(userId: string) {
    const missions = await this.prisma.mission.findMany({ where: { isActive: true } });
    const progress = await this.prisma.missionProgress.findMany({ where: { userId } });
    const progressMap = new Map(progress.map((p) => [p.missionId, p]));

    return missions.map((m) => {
      const p = progressMap.get(m.id);
      return {
        ...m,
        currentCount: p?.currentCount ?? 0,
        completed: p?.completed ?? false,
        completedAt: p?.completedAt,
      };
    });
  }
}

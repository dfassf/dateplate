import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSessionDto, VoteDto } from './dto/index.js';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(creatorId: string, dto: CreateSessionDto) {
    return this.prisma.session.create({
      data: {
        type: dto.type,
        title: dto.title,
        teamId: dto.teamId,
        creatorId,
        options: {
          create: dto.options.map((o) => ({
            name: o.name,
            restaurantId: o.restaurantId,
            weight: o.weight ?? 1,
          })),
        },
      },
      include: { options: { include: { restaurant: true } } },
    });
  }

  async findById(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        options: { include: { restaurant: true, votes: true } },
        votes: true,
      },
    });
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다');
    return session;
  }

  async findByTeam(teamId: string, status?: string) {
    return this.prisma.session.findMany({
      where: { teamId, ...(status ? { status } : {}) },
      include: {
        options: true,
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async vote(sessionId: string, voterId: string, dto: VoteDto) {
    await this.findById(sessionId);
    return this.prisma.sessionVote.create({
      data: {
        sessionId,
        optionId: dto.optionId,
        voterId,
        round: dto.round,
      },
    });
  }

  async spin(sessionId: string) {
    const session = await this.findById(sessionId);
    const options = session.options;
    if (options.length === 0) throw new NotFoundException('옵션이 없습니다');

    // 가중치 기반 랜덤 선택
    const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
    let random = Math.random() * totalWeight;
    let winner = options[0];
    for (const opt of options) {
      random -= opt.weight;
      if (random <= 0) {
        winner = opt;
        break;
      }
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED', result: winner.name },
    });

    return { winner, session: await this.findById(sessionId) };
  }

  async complete(sessionId: string, result: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED', result },
      include: { options: { include: { restaurant: true } } },
    });
  }
}

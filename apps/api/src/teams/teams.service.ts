import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateTeamDto } from './dto/index.js';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(leaderId: string, name: string) {
    return this.prisma.team.create({
      data: {
        name,
        leaderId,
        members: { create: { userId: leaderId, role: 'LEADER' } },
      },
      include: { members: { include: { user: { omit: { password: true } } } } },
    });
  }

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: { members: { include: { user: { omit: { password: true } } } } },
    });
    if (!team) throw new NotFoundException('팀을 찾을 수 없습니다');
    return team;
  }

  async getMyTeams(userId: string) {
    return this.prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: { members: { include: { user: { omit: { password: true } } } } },
    });
  }

  async update(id: string, userId: string, dto: UpdateTeamDto) {
    const team = await this.findById(id);
    if (team.leaderId !== userId) throw new ForbiddenException('팀장만 수정할 수 있습니다');
    return this.prisma.team.update({
      where: { id },
      data: dto,
      include: { members: { include: { user: { omit: { password: true } } } } },
    });
  }

  async remove(id: string, userId: string) {
    const team = await this.findById(id);
    if (team.leaderId !== userId) throw new ForbiddenException('팀장만 삭제할 수 있습니다');
    await this.prisma.$transaction([
      this.prisma.teamInvite.deleteMany({ where: { teamId: id } }),
      this.prisma.teamMember.deleteMany({ where: { teamId: id } }),
      this.prisma.team.delete({ where: { id } }),
    ]);
    return { deleted: true };
  }

  async removeMember(teamId: string, memberId: string, userId: string) {
    const team = await this.findById(teamId);
    if (team.leaderId !== userId && memberId !== userId) {
      throw new ForbiddenException('팀장 또는 본인만 탈퇴 가능합니다');
    }
    await this.prisma.teamMember.deleteMany({ where: { teamId, userId: memberId } });
    return this.findById(teamId);
  }

  async createInvite(teamId: string, inviterId: string) {
    const inviteCode = randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.prisma.teamInvite.create({
      data: { teamId, inviteCode, expiresAt, inviterId },
    });
  }

  async acceptInvite(userId: string, inviteCode: string) {
    const invite = await this.prisma.teamInvite.findUnique({ where: { inviteCode } });
    if (!invite || invite.status !== 'PENDING') {
      throw new NotFoundException('유효하지 않은 초대 코드입니다');
    }
    if (invite.expiresAt < new Date()) {
      await this.prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      });
      throw new ConflictException('만료된 초대 코드입니다');
    }

    const existing = await this.prisma.teamMember.findFirst({
      where: { teamId: invite.teamId, userId },
    });
    if (existing) throw new ConflictException('이미 팀에 소속되어 있습니다');

    await this.prisma.$transaction([
      this.prisma.teamMember.create({
        data: { teamId: invite.teamId, userId, role: 'MEMBER' },
      }),
      this.prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED', inviteeId: userId },
      }),
    ]);

    return this.findById(invite.teamId);
  }
}

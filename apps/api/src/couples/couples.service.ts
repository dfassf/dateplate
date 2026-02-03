import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CoupleInviteStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInviteDto, AcceptInviteDto, UpdateCoupleDto } from './dto';

@Injectable()
export class CouplesService {
  constructor(private prisma: PrismaService) {}

  async createInvite(userId: string, dto: CreateInviteDto) {
    // 이미 커플인지 확인
    const existingCouple = await this.prisma.couple.findFirst({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (existingCouple) {
      throw new BadRequestException('이미 커플로 등록되어 있습니다');
    }

    // 기존 PENDING 초대가 있으면 취소
    await this.prisma.coupleInvite.updateMany({
      where: {
        inviterId: userId,
        status: CoupleInviteStatus.PENDING,
      },
      data: {
        status: CoupleInviteStatus.CANCELLED,
      },
    });

    // 초대 코드 생성 (8자리 영문숫자)
    const inviteCode = this.generateInviteCode();

    // 만료 시간 설정 (24시간)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const invite = await this.prisma.coupleInvite.create({
      data: {
        inviteCode,
        inviterId: userId,
        coupleName: dto.coupleName,
        expiresAt,
      },
    });

    return {
      inviteCode: invite.inviteCode,
      expiresAt: invite.expiresAt,
    };
  }

  async acceptInvite(userId: string, dto: AcceptInviteDto) {
    // 이미 커플인지 확인
    const existingCouple = await this.prisma.couple.findFirst({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (existingCouple) {
      throw new BadRequestException('이미 커플로 등록되어 있습니다');
    }

    // 초대 코드 확인
    const invite = await this.prisma.coupleInvite.findFirst({
      where: {
        inviteCode: dto.inviteCode,
        status: CoupleInviteStatus.PENDING,
      },
    });

    if (!invite) {
      throw new NotFoundException('유효하지 않은 초대 코드입니다');
    }

    // 만료 확인
    if (invite.expiresAt < new Date()) {
      await this.prisma.coupleInvite.update({
        where: { id: invite.id },
        data: { status: CoupleInviteStatus.EXPIRED },
      });
      throw new BadRequestException('만료된 초대 코드입니다');
    }

    // 자기 자신 초대 방지
    if (invite.inviterId === userId) {
      throw new BadRequestException('자신의 초대 코드는 사용할 수 없습니다');
    }

    // 트랜잭션으로 커플 생성 및 초대 상태 업데이트
    const couple = await this.prisma.$transaction(async (tx) => {
      // 초대 상태 업데이트
      await tx.coupleInvite.update({
        where: { id: invite.id },
        data: {
          status: CoupleInviteStatus.ACCEPTED,
          inviteeId: userId,
        },
      });

      // 커플 생성
      return tx.couple.create({
        data: {
          name: invite.coupleName,
          user1Id: invite.inviterId,
          user2Id: userId,
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

    return couple;
  }

  async getMyCouple(userId: string) {
    const couple = await this.prisma.couple.findFirst({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
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

    return couple;
  }

  async updateCouple(userId: string, coupleId: string, dto: UpdateCoupleDto) {
    const couple = await this.prisma.couple.findUnique({
      where: { id: coupleId },
    });

    if (!couple) {
      throw new NotFoundException('커플 정보를 찾을 수 없습니다');
    }

    if (couple.user1Id !== userId && couple.user2Id !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return this.prisma.couple.update({
      where: { id: coupleId },
      data: dto,
      include: {
        user1: {
          select: { id: true, email: true, name: true },
        },
        user2: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async getMyPendingInvite(userId: string) {
    return this.prisma.coupleInvite.findFirst({
      where: {
        inviterId: userId,
        status: CoupleInviteStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

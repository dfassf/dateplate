import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDateRecordDto, UpdateDateRecordDto } from './dto';

@Injectable()
export class DateRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateDateRecordDto) {
    const couple = await this.getUserCouple(userId);

    if (!couple) {
      throw new BadRequestException('커플 등록이 필요합니다');
    }

    // 식당 존재 확인
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('식당을 찾을 수 없습니다');
    }

    return this.prisma.dateRecord.create({
      data: {
        date: new Date(dto.date),
        memo: dto.memo,
        amount: dto.amount,
        coupleId: couple.id,
        restaurantId: dto.restaurantId,
      },
      include: {
        restaurant: true,
      },
    });
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const couple = await this.getUserCouple(userId);

    if (!couple) {
      return { data: [], total: 0, page, limit };
    }

    const [data, total] = await Promise.all([
      this.prisma.dateRecord.findMany({
        where: { coupleId: couple.id },
        include: {
          restaurant: true,
          review: true,
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dateRecord.count({
        where: { coupleId: couple.id },
      }),
    ]);

    return { data, total, page, limit };
  }

  async findById(userId: string, id: string) {
    const couple = await this.getUserCouple(userId);

    const dateRecord = await this.prisma.dateRecord.findUnique({
      where: { id },
      include: {
        restaurant: true,
        review: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!dateRecord) {
      throw new NotFoundException('데이트 기록을 찾을 수 없습니다');
    }

    if (!couple || dateRecord.coupleId !== couple.id) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return dateRecord;
  }

  async update(userId: string, id: string, dto: UpdateDateRecordDto) {
    await this.findById(userId, id);

    return this.prisma.dateRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        memo: dto.memo,
        amount: dto.amount,
      },
      include: {
        restaurant: true,
      },
    });
  }

  async delete(userId: string, id: string) {
    await this.findById(userId, id);

    await this.prisma.dateRecord.delete({
      where: { id },
    });

    return { success: true };
  }

  private async getUserCouple(userId: string) {
    return this.prisma.couple.findFirst({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });
  }
}

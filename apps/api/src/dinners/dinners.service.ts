import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDinnerDto, UpdateDinnerDto } from './dto/index.js';

@Injectable()
export class DinnersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDinnerDto, userId: string) {
    return this.prisma.dinnerRecord.create({
      data: { ...dto, date: new Date(dto.date), createdBy: userId },
      include: { restaurant: true },
    });
  }

  async findByTeam(teamId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, sort = 'date', order = 'desc' } = pagination;

    const [data, total] = await Promise.all([
      this.prisma.dinnerRecord.findMany({
        where: { teamId },
        include: { restaurant: true, reviews: true },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dinnerRecord.count({ where: { teamId } }),
    ]);

    return { data, total, page, limit };
  }

  async findRecentByUser(userId: string) {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [recent, thisMonthCount] = await Promise.all([
      this.prisma.dinnerRecord.findMany({
        where: { team: { members: { some: { userId } } } },
        include: { restaurant: true, team: true, reviews: true },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      this.prisma.dinnerRecord.count({
        where: {
          team: { members: { some: { userId } } },
          date: { gte: startOfMonth },
        },
      }),
    ]);

    return { recent, thisMonthCount };
  }

  async findById(id: string) {
    const record = await this.prisma.dinnerRecord.findUnique({
      where: { id },
      include: {
        restaurant: true,
        creator: true,
        reviews: { include: { author: true, images: true, tags: true } },
      },
    });

    if (!record) {
      throw new NotFoundException('회식 기록을 찾을 수 없습니다');
    }

    return record;
  }

  async update(id: string, userId: string, dto: UpdateDinnerDto) {
    const record = await this.findById(id);
    if (record.createdBy !== userId) {
      throw new ForbiddenException('본인이 작성한 회식 기록만 수정할 수 있습니다');
    }

    const data: Prisma.DinnerRecordUpdateInput = {
      memo: dto.memo,
      totalAmount: dto.totalAmount,
      headcount: dto.headcount,
      ...(dto.date ? { date: new Date(dto.date) } : {}),
    };

    return this.prisma.dinnerRecord.update({
      where: { id },
      data,
      include: { restaurant: true },
    });
  }

  async remove(id: string, userId: string) {
    const record = await this.findById(id);
    if (record.createdBy !== userId) {
      throw new ForbiddenException('본인이 작성한 회식 기록만 삭제할 수 있습니다');
    }

    await this.prisma.dinnerRecord.delete({ where: { id } });
    return { deleted: true };
  }
}

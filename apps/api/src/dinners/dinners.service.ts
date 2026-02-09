import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDinnerDto, UpdateDinnerDto } from './dto/index.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';

@Injectable()
export class DinnersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDinnerDto) {
    return this.prisma.dinnerRecord.create({
      data: { ...dto, date: new Date(dto.date) },
      include: { restaurant: true },
    });
  }

  async findByTeam(teamId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, sort = 'date', order = 'desc' } = pagination;
    const [data, total] = await Promise.all([
      this.prisma.dinnerRecord.findMany({
        where: { teamId },
        include: { restaurant: true, review: true },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dinnerRecord.count({ where: { teamId } }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const record = await this.prisma.dinnerRecord.findUnique({
      where: { id },
      include: { restaurant: true, review: { include: { images: true, tags: true } } },
    });
    if (!record) throw new NotFoundException('회식 기록을 찾을 수 없습니다');
    return record;
  }

  async update(id: string, dto: UpdateDinnerDto) {
    await this.findById(id);
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.dinnerRecord.update({
      where: { id },
      data,
      include: { restaurant: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.dinnerRecord.delete({ where: { id } });
    return { deleted: true };
  }
}

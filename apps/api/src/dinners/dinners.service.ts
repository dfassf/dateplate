import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDinnerDto, UpdateDinnerDto } from './dto/index.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';

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
      include: { restaurant: true, creator: true, review: { include: { images: true, tags: true } } },
    });
    if (!record) throw new NotFoundException('회식 기록을 찾을 수 없습니다');
    return record;
  }

  async update(id: string, userId: string, dto: UpdateDinnerDto) {
    const record = await this.findById(id);
    if (record.createdBy !== userId) {
      throw new ForbiddenException('본인이 작성한 회식 기록만 수정할 수 있습니다');
    }
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
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

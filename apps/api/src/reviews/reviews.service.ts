import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReviewDto, UpdateReviewDto } from './dto/index.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReviewDto, authorId: string) {
    return this.prisma.review.create({
      data: { ...dto, authorId },
      include: { restaurant: true, author: true },
    });
  }

  async findByTeam(teamId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, order = 'desc' } = pagination;
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { teamId },
        include: { restaurant: true, author: true, tags: true },
        orderBy: { createdAt: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where: { teamId } }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { restaurant: true, author: true, images: true, tags: true, dinnerRecord: true },
    });
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다');
    return review;
  }

  async update(id: string, dto: UpdateReviewDto) {
    await this.findById(id);
    return this.prisma.review.update({
      where: { id },
      data: dto,
      include: { restaurant: true, author: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.review.delete({ where: { id } });
    return { deleted: true };
  }
}

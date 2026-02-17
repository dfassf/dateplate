import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReviewDto, UpdateReviewDto } from './dto/index.js';

const COMMUNITY_VISIBILITIES = ['COMMUNITY', 'PUBLIC'];

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  private getPagination(page = 1, limit = 20) {
    return { page, limit, skip: (page - 1) * limit };
  }

  private buildTagConnectOrCreate(tagNames?: string[]) {
    const normalizedTagNames = Array.from(new Set((tagNames ?? []).map((name) => name.trim()))).filter(
      (name) => name.length > 0,
    );
    if (normalizedTagNames.length === 0) return undefined;

    return normalizedTagNames.map((name) => ({
      where: { name },
      create: { name },
    }));
  }

  async create(dto: CreateReviewDto, authorId: string) {
    const existing = await this.prisma.review.findFirst({
      where: { dinnerRecordId: dto.dinnerRecordId, authorId },
    });

    if (existing) {
      throw new ConflictException('이미 이 회식에 대한 리뷰를 작성하셨습니다');
    }

    const { tagNames, ...rest } = dto;
    const tagConnectOrCreate = this.buildTagConnectOrCreate(tagNames);

    return this.prisma.review.create({
      data: {
        ...rest,
        authorId,
        tags: tagConnectOrCreate
          ? {
              connectOrCreate: tagConnectOrCreate,
            }
          : undefined,
      },
      include: { restaurant: true, author: true, tags: true },
    });
  }

  async findByTeam(teamId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, order = 'desc' } = pagination;
    const { skip } = this.getPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { teamId },
        include: { restaurant: true, author: true, tags: true },
        orderBy: { createdAt: order },
        skip,
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

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다');
    }

    return review;
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.findById(id);
    if (review.authorId !== userId) {
      throw new ForbiddenException('본인이 작성한 리뷰만 수정할 수 있습니다');
    }

    const { tagNames, ...rest } = dto;
    const tagConnectOrCreate = this.buildTagConnectOrCreate(tagNames);

    return this.prisma.review.update({
      where: { id },
      data: {
        ...rest,
        tags: tagConnectOrCreate
          ? {
              set: [],
              connectOrCreate: tagConnectOrCreate,
            }
          : undefined,
      },
      include: { restaurant: true, author: true, tags: true },
    });
  }

  async findCommunity(tag?: string, page = 1, limit = 20) {
    const { skip } = this.getPagination(page, limit);
    const where: Prisma.ReviewWhereInput = { visibility: { in: COMMUNITY_VISIBILITIES } };
    if (tag) {
      where.tags = { some: { name: tag } };
    }

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: { restaurant: true, author: { omit: { password: true } }, tags: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async remove(id: string, userId: string) {
    const review = await this.findById(id);
    if (review.authorId !== userId) {
      throw new ForbiddenException('본인이 작성한 리뷰만 삭제할 수 있습니다');
    }

    await this.prisma.review.delete({ where: { id } });
    return { deleted: true };
  }
}

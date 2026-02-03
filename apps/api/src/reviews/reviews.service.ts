import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ReviewVisibility, ReviewImageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const couple = await this.getUserCouple(userId);

    if (!couple) {
      throw new BadRequestException('커플 등록이 필요합니다');
    }

    // 데이트 기록 확인
    const dateRecord = await this.prisma.dateRecord.findUnique({
      where: { id: dto.dateRecordId },
    });

    if (!dateRecord) {
      throw new NotFoundException('데이트 기록을 찾을 수 없습니다');
    }

    if (dateRecord.coupleId !== couple.id) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    // 이미 리뷰가 있는지 확인
    const existingReview = await this.prisma.review.findUnique({
      where: { dateRecordId: dto.dateRecordId },
    });

    if (existingReview) {
      throw new BadRequestException('이미 리뷰가 작성되어 있습니다');
    }

    // 영수증 이미지 여부로 인증 처리
    const hasReceipt = dto.images?.some(
      (img) => img.type === ReviewImageType.RECEIPT,
    );

    return this.prisma.review.create({
      data: {
        content: dto.content,
        rating: dto.rating,
        visibility: dto.visibility || ReviewVisibility.PRIVATE,
        isVerified: hasReceipt || false,
        coupleId: couple.id,
        restaurantId: dateRecord.restaurantId,
        dateRecordId: dto.dateRecordId,
        authorId: userId,
        images: dto.images
          ? {
              create: dto.images.map((img) => ({
                imageUrl: img.imageUrl,
                type: img.type,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        restaurant: true,
      },
    });
  }

  async findById(userId: string, id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        images: true,
        restaurant: true,
        author: {
          select: { id: true, name: true },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다');
    }

    // 비공개 리뷰는 커플만 볼 수 있음
    if (review.visibility === ReviewVisibility.PRIVATE) {
      const couple = await this.getUserCouple(userId);
      if (!couple || review.coupleId !== couple.id) {
        throw new ForbiddenException('접근 권한이 없습니다');
      }
    }

    return review;
  }

  async update(userId: string, id: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다');
    }

    // 작성자만 수정 가능
    if (review.authorId !== userId) {
      throw new ForbiddenException('수정 권한이 없습니다');
    }

    return this.prisma.review.update({
      where: { id },
      data: dto,
      include: {
        images: true,
        restaurant: true,
      },
    });
  }

  async delete(userId: string, id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다');
    }

    // 작성자만 삭제 가능
    if (review.authorId !== userId) {
      throw new ForbiddenException('삭제 권한이 없습니다');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return { success: true };
  }

  async findPublicReviews(restaurantId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          restaurantId,
          visibility: ReviewVisibility.PUBLIC,
        },
        include: {
          images: true,
          author: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({
        where: {
          restaurantId,
          visibility: ReviewVisibility.PUBLIC,
        },
      }),
    ]);

    return { data, total, page, limit };
  }

  async findCommunityReviews(restaurantId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          restaurantId,
          visibility: {
            in: [ReviewVisibility.PUBLIC, ReviewVisibility.COMMUNITY],
          },
        },
        include: {
          images: true,
          author: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({
        where: {
          restaurantId,
          visibility: {
            in: [ReviewVisibility.PUBLIC, ReviewVisibility.COMMUNITY],
          },
        },
      }),
    ]);

    return { data, total, page, limit };
  }

  private async getUserCouple(userId: string) {
    return this.prisma.couple.findFirst({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });
  }
}

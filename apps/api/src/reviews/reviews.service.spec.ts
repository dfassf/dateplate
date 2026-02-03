import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewVisibility, ReviewImageType } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockPrismaService = {
    couple: {
      findFirst: jest.fn(),
    },
    dateRecord: {
      findUnique: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockCouple = { id: 'couple-id', user1Id: 'user-1', user2Id: 'user-2' };
  const mockDateRecord = {
    id: 'record-id',
    coupleId: 'couple-id',
    restaurantId: 'restaurant-id',
  };
  const mockReview = {
    id: 'review-id',
    content: '맛있어요',
    rating: 5,
    visibility: ReviewVisibility.PRIVATE,
    isVerified: false,
    coupleId: 'couple-id',
    restaurantId: 'restaurant-id',
    dateRecordId: 'record-id',
    authorId: 'user-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      dateRecordId: 'record-id',
      content: '맛있어요',
      rating: 5,
    };

    it('리뷰를 생성해야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.dateRecord.findUnique.mockResolvedValue(mockDateRecord);
      mockPrismaService.review.findUnique.mockResolvedValue(null);
      mockPrismaService.review.create.mockResolvedValue(mockReview);

      const result = await service.create('user-1', dto);

      expect(result).toEqual(mockReview);
    });

    it('영수증 이미지가 있으면 인증 처리해야 한다', async () => {
      const dtoWithReceipt = {
        ...dto,
        images: [
          { imageUrl: 'http://image.url', type: ReviewImageType.RECEIPT },
        ],
      };
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.dateRecord.findUnique.mockResolvedValue(mockDateRecord);
      mockPrismaService.review.findUnique.mockResolvedValue(null);
      mockPrismaService.review.create.mockResolvedValue({
        ...mockReview,
        isVerified: true,
      });

      const result = await service.create('user-1', dtoWithReceipt);

      expect(mockPrismaService.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isVerified: true,
          }),
        }),
      );
    });

    it('커플이 아니면 BadRequestException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(null);

      await expect(service.create('user-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('데이트 기록이 없으면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.dateRecord.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('다른 커플의 기록이면 ForbiddenException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.dateRecord.findUnique.mockResolvedValue({
        ...mockDateRecord,
        coupleId: 'other-couple-id',
      });

      await expect(service.create('user-1', dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('이미 리뷰가 있으면 BadRequestException을 던져야 한다', async () => {
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);
      mockPrismaService.dateRecord.findUnique.mockResolvedValue(mockDateRecord);
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);

      await expect(service.create('user-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findById', () => {
    it('리뷰를 반환해야 한다', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.couple.findFirst.mockResolvedValue(mockCouple);

      const result = await service.findById('user-1', 'review-id');

      expect(result).toEqual(mockReview);
    });

    it('존재하지 않는 리뷰면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.findById('user-1', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('비공개 리뷰에 다른 커플이 접근하면 ForbiddenException을 던져야 한다', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.couple.findFirst.mockResolvedValue({
        ...mockCouple,
        id: 'other-couple-id',
      });

      await expect(service.findById('user-3', 'review-id')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('공개 리뷰는 누구나 볼 수 있어야 한다', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue({
        ...mockReview,
        visibility: ReviewVisibility.PUBLIC,
      });

      const result = await service.findById('user-3', 'review-id');

      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('리뷰를 업데이트해야 한다', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.review.update.mockResolvedValue({
        ...mockReview,
        content: '더 맛있어요',
      });

      const result = await service.update('user-1', 'review-id', {
        content: '더 맛있어요',
      });

      expect(result.content).toBe('더 맛있어요');
    });

    it('존재하지 않는 리뷰면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'invalid-id', { content: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('작성자가 아니면 ForbiddenException을 던져야 한다', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);

      await expect(
        service.update('user-2', 'review-id', { content: 'test' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('리뷰를 삭제해야 한다', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
      mockPrismaService.review.delete.mockResolvedValue({});

      const result = await service.delete('user-1', 'review-id');

      expect(result).toEqual({ success: true });
    });

    it('존재하지 않는 리뷰면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.delete('user-1', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('작성자가 아니면 ForbiddenException을 던져야 한다', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);

      await expect(service.delete('user-2', 'review-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findPublicReviews', () => {
    it('공개 리뷰 목록을 반환해야 한다', async () => {
      mockPrismaService.review.findMany.mockResolvedValue([mockReview]);
      mockPrismaService.review.count.mockResolvedValue(1);

      const result = await service.findPublicReviews('restaurant-id', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrismaService.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            restaurantId: 'restaurant-id',
            visibility: ReviewVisibility.PUBLIC,
          },
        }),
      );
    });
  });

  describe('findCommunityReviews', () => {
    it('커뮤니티 및 공개 리뷰 목록을 반환해야 한다', async () => {
      mockPrismaService.review.findMany.mockResolvedValue([mockReview]);
      mockPrismaService.review.count.mockResolvedValue(1);

      const result = await service.findCommunityReviews('restaurant-id', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            restaurantId: 'restaurant-id',
            visibility: {
              in: [ReviewVisibility.PUBLIC, ReviewVisibility.COMMUNITY],
            },
          },
        }),
      );
    });
  });
});

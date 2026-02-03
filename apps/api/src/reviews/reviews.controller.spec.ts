import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  const mockReviewsService = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findPublicReviews: jest.fn(),
    findCommunityReviews: jest.fn(),
  };

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: '테스트',
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: mockReviewsService }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('리뷰를 생성해야 한다', async () => {
      const dto = {
        dateRecordId: 'record-id',
        content: '맛있어요',
        rating: 5,
      };
      const result = { id: 'review-id', ...dto };
      mockReviewsService.create.mockResolvedValue(result);

      expect(await controller.create(mockUser as any, dto)).toEqual(result);
      expect(mockReviewsService.create).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('findById', () => {
    it('리뷰를 반환해야 한다', async () => {
      const result = { id: 'review-id' };
      mockReviewsService.findById.mockResolvedValue(result);

      expect(await controller.findById(mockUser as any, 'review-id')).toEqual(result);
      expect(mockReviewsService.findById).toHaveBeenCalledWith('user-id', 'review-id');
    });
  });

  describe('update', () => {
    it('리뷰를 업데이트해야 한다', async () => {
      const dto = { content: '더 맛있어요' };
      const result = { id: 'review-id', content: '더 맛있어요' };
      mockReviewsService.update.mockResolvedValue(result);

      expect(await controller.update(mockUser as any, 'review-id', dto)).toEqual(result);
      expect(mockReviewsService.update).toHaveBeenCalledWith('user-id', 'review-id', dto);
    });
  });

  describe('delete', () => {
    it('리뷰를 삭제해야 한다', async () => {
      const result = { success: true };
      mockReviewsService.delete.mockResolvedValue(result);

      expect(await controller.delete(mockUser as any, 'review-id')).toEqual(result);
      expect(mockReviewsService.delete).toHaveBeenCalledWith('user-id', 'review-id');
    });
  });

  describe('findPublicReviews', () => {
    it('공개 리뷰 목록을 반환해야 한다', async () => {
      const result = { data: [], total: 0, page: 1, limit: 20 };
      mockReviewsService.findPublicReviews.mockResolvedValue(result);

      expect(await controller.findPublicReviews('restaurant-id', '1', '20')).toEqual(result);
      expect(mockReviewsService.findPublicReviews).toHaveBeenCalledWith('restaurant-id', 1, 20);
    });

    it('페이지네이션 기본값을 사용해야 한다', async () => {
      mockReviewsService.findPublicReviews.mockResolvedValue({ data: [] });

      await controller.findPublicReviews('restaurant-id', undefined, undefined);

      expect(mockReviewsService.findPublicReviews).toHaveBeenCalledWith('restaurant-id', 1, 20);
    });
  });

  describe('findCommunityReviews', () => {
    it('커뮤니티 리뷰 목록을 반환해야 한다', async () => {
      const result = { data: [], total: 0, page: 1, limit: 20 };
      mockReviewsService.findCommunityReviews.mockResolvedValue(result);

      expect(await controller.findCommunityReviews('restaurant-id', '1', '20')).toEqual(result);
      expect(mockReviewsService.findCommunityReviews).toHaveBeenCalledWith('restaurant-id', 1, 20);
    });
  });
});

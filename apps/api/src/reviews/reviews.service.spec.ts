import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import { ReviewsService } from './reviews.service.js';

describe('ReviewsService', () => {
  const prismaMock = {
    review: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: ReviewsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReviewsService(prismaMock as unknown as PrismaService);
  });

  describe('create', () => {
    it('throws ConflictException when author already wrote a review for dinner', async () => {
      prismaMock.review.findFirst.mockResolvedValue({ id: 'existing-review' });

      await expect(
        service.create(
          {
            dinnerRecordId: 'dinner-1',
            restaurantId: 'restaurant-1',
            teamId: 'team-1',
            rating: 5,
            content: 'great',
          },
          'author-1',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.review.create).not.toHaveBeenCalled();
    });

    it('normalizes tags (trim/deduplicate) before connectOrCreate', async () => {
      prismaMock.review.findFirst.mockResolvedValue(null);
      prismaMock.review.create.mockResolvedValue({ id: 'review-1' });

      await service.create(
        {
          dinnerRecordId: 'dinner-1',
          restaurantId: 'restaurant-1',
          teamId: 'team-1',
          rating: 4,
          content: 'good',
          tagNames: [' 가성비좋은 ', '가성비좋은', '', '분위기좋은'],
        },
        'author-1',
      );

      expect(prismaMock.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            authorId: 'author-1',
            tags: {
              connectOrCreate: [
                { where: { name: '가성비좋은' }, create: { name: '가성비좋은' } },
                { where: { name: '분위기좋은' }, create: { name: '분위기좋은' } },
              ],
            },
          }),
        }),
      );
    });

    it('omits tags when tagNames are absent', async () => {
      prismaMock.review.findFirst.mockResolvedValue(null);
      prismaMock.review.create.mockResolvedValue({ id: 'review-1' });

      await service.create(
        {
          dinnerRecordId: 'dinner-1',
          restaurantId: 'restaurant-1',
          teamId: 'team-1',
          rating: 4,
          content: 'good',
        },
        'author-1',
      );

      expect(prismaMock.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            authorId: 'author-1',
            tags: undefined,
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when review does not exist', async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findByTeam', () => {
    it('applies pagination and ordering from query dto', async () => {
      prismaMock.review.findMany.mockResolvedValue([]);
      prismaMock.review.count.mockResolvedValue(0);

      const result = await service.findByTeam('team-1', { page: 3, limit: 5, order: 'asc' });

      expect(prismaMock.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teamId: 'team-1' },
          orderBy: { createdAt: 'asc' },
          skip: 10,
          take: 5,
        }),
      );
      expect(result).toEqual({ data: [], total: 0, page: 3, limit: 5 });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: 'review-1',
        authorId: 'author-1',
        rating: 4,
        tags: [],
        images: [],
        dinnerRecord: {},
        author: {},
        restaurant: {},
      });
    });

    it('throws ForbiddenException when requester is not author', async () => {
      await expect(
        service.update('review-1', 'another-user', { rating: 3, content: 'edited' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prismaMock.review.update).not.toHaveBeenCalled();
    });

    it('clears existing tags and applies normalized tags on update', async () => {
      prismaMock.review.update.mockResolvedValue({ id: 'review-1' });

      await service.update('review-1', 'author-1', {
        tagNames: [' 분위기좋은 ', '분위기좋은', '친절한'],
      });

      expect(prismaMock.review.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'review-1' },
          data: expect.objectContaining({
            tags: {
              set: [],
              connectOrCreate: [
                { where: { name: '분위기좋은' }, create: { name: '분위기좋은' } },
                { where: { name: '친절한' }, create: { name: '친절한' } },
              ],
            },
          }),
        }),
      );
    });
  });

  describe('findCommunity', () => {
    it('queries only public/community reviews and applies tag filter', async () => {
      prismaMock.review.findMany.mockResolvedValue([]);
      prismaMock.review.count.mockResolvedValue(0);

      const result = await service.findCommunity('가성비좋은', 2, 10);

      expect(prismaMock.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            visibility: { in: ['COMMUNITY', 'PUBLIC'] },
            tags: { some: { name: '가성비좋은' } },
          },
          skip: 10,
          take: 10,
        }),
      );
      expect(result).toEqual({ data: [], total: 0, page: 2, limit: 10 });
    });

    it('keeps visibility filter even without tag', async () => {
      prismaMock.review.findMany.mockResolvedValue([]);
      prismaMock.review.count.mockResolvedValue(0);

      await service.findCommunity(undefined, 1, 20);

      expect(prismaMock.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            visibility: { in: ['COMMUNITY', 'PUBLIC'] },
          },
        }),
      );
    });
  });

  describe('remove', () => {
    it('throws ForbiddenException when requester is not author', async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: 'review-1',
        authorId: 'author-1',
        tags: [],
        images: [],
        dinnerRecord: {},
        author: {},
        restaurant: {},
      });

      await expect(service.remove('review-1', 'other-user')).rejects.toBeInstanceOf(ForbiddenException);
      expect(prismaMock.review.delete).not.toHaveBeenCalled();
    });

    it('deletes review and returns deleted flag when author matches', async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: 'review-1',
        authorId: 'author-1',
        tags: [],
        images: [],
        dinnerRecord: {},
        author: {},
        restaurant: {},
      });

      const result = await service.remove('review-1', 'author-1');

      expect(prismaMock.review.delete).toHaveBeenCalledWith({ where: { id: 'review-1' } });
      expect(result).toEqual({ deleted: true });
    });
  });
});

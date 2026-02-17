import { ConflictException, ForbiddenException } from '@nestjs/common';
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

  it('create should throw ConflictException when author already wrote review for dinner', async () => {
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

  it('create should connect or create tags when tagNames are provided', async () => {
    prismaMock.review.findFirst.mockResolvedValue(null);
    prismaMock.review.create.mockResolvedValue({ id: 'review-1' });

    await service.create(
      {
        dinnerRecordId: 'dinner-1',
        restaurantId: 'restaurant-1',
        teamId: 'team-1',
        rating: 4,
        content: 'good',
        tagNames: ['가성비좋은', '분위기좋은'],
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

  it('update should throw ForbiddenException when requester is not the author', async () => {
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

    await expect(
      service.update('review-1', 'another-user', { rating: 3, content: 'edited' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prismaMock.review.update).not.toHaveBeenCalled();
  });

  it('findCommunity should query only public/community reviews and apply tag filter', async () => {
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

  it('remove should delete review and return deleted flag when author matches', async () => {
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

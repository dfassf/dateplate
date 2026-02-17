import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { calcAvgRating } from '../common/utils/rating.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRestaurantDto } from './dto/index.js';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRestaurantDto) {
    if (dto.kakaoPlaceId) {
      const existing = await this.prisma.restaurant.findUnique({
        where: { kakaoPlaceId: dto.kakaoPlaceId },
      });
      if (existing) {
        return existing;
      }
    }

    return this.prisma.restaurant.create({ data: dto });
  }

  async findAll(search?: string) {
    return this.prisma.restaurant.findMany({
      where: search ? { name: { contains: search } } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findByTeam(teamId: string, sortBy = 'name') {
    const restaurants = await this.prisma.restaurant.findMany({
      where: { dinnerRecords: { some: { teamId } } },
      include: {
        _count: { select: { dinnerRecords: { where: { teamId } } } },
        reviews: { where: { teamId }, select: { rating: true } },
      },
    });

    const result = restaurants.map((restaurant) => {
      const { reviews, _count, ...rest } = restaurant;
      const visitCount = _count.dinnerRecords;
      const avgRating = calcAvgRating(reviews);
      return { ...rest, visitCount, avgRating };
    });

    if (sortBy === 'rating') {
      result.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sortBy === 'visits') {
      result.sort((a, b) => b.visitCount - a.visitCount);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }

  async findRankings(sortBy = 'rating', category?: string, limit = 20) {
    const where: Prisma.RestaurantWhereInput = {
      reviews: { some: { visibility: { in: ['COMMUNITY', 'PUBLIC'] } } },
    };

    if (category) {
      where.category = category;
    }

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      include: {
        _count: { select: { dinnerRecords: true } },
        reviews: {
          where: { visibility: { in: ['COMMUNITY', 'PUBLIC'] } },
          select: { rating: true },
        },
      },
    });

    const result = restaurants.map((restaurant) => {
      const { reviews, _count, ...rest } = restaurant;
      const visitCount = _count.dinnerRecords;
      const reviewCount = reviews.length;
      const avgRating = calcAvgRating(reviews);
      return { ...rest, visitCount, reviewCount, avgRating };
    });

    if (sortBy === 'visits') {
      result.sort((a, b) => b.visitCount - a.visitCount);
    } else {
      result.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    }

    return result.slice(0, limit);
  }

  async findById(id: string) {
    return this.prisma.restaurant.findUnique({ where: { id } });
  }
}

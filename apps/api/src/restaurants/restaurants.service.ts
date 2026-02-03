import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRestaurantDto) {
    // 카카오 Place ID로 중복 체크
    if (dto.kakaoPlaceId) {
      const existing = await this.prisma.restaurant.findFirst({
        where: { kakaoPlaceId: dto.kakaoPlaceId },
      });

      if (existing) {
        return existing;
      }
    }

    return this.prisma.restaurant.create({
      data: dto,
    });
  }

  async findById(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('식당을 찾을 수 없습니다');
    }

    return restaurant;
  }

  async search(query: string, limit = 20) {
    return this.prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { address: { contains: query } },
          { category: { contains: query } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByKakaoPlaceId(kakaoPlaceId: string) {
    return this.prisma.restaurant.findFirst({
      where: { kakaoPlaceId },
    });
  }

  async findOrCreate(dto: CreateRestaurantDto) {
    if (dto.kakaoPlaceId) {
      const existing = await this.findByKakaoPlaceId(dto.kakaoPlaceId);
      if (existing) {
        return existing;
      }
    }

    return this.create(dto);
  }
}

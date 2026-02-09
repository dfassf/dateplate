import { Injectable } from '@nestjs/common';
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
      if (existing) return existing;
    }
    return this.prisma.restaurant.create({ data: dto });
  }

  async findAll(search?: string) {
    return this.prisma.restaurant.findMany({
      where: search ? { name: { contains: search } } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.restaurant.findUnique({ where: { id } });
  }
}

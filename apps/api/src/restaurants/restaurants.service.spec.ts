import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RestaurantsService', () => {
  let service: RestaurantsService;

  const mockPrismaService = {
    restaurant: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockRestaurant = {
    id: 'restaurant-id',
    name: '맛집',
    address: '서울시 강남구',
    latitude: 37.5,
    longitude: 127.0,
    category: '한식',
    kakaoPlaceId: 'kakao-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      name: '맛집',
      address: '서울시 강남구',
      latitude: 37.5,
      longitude: 127.0,
      category: '한식',
      kakaoPlaceId: 'kakao-123',
    };

    it('새 식당을 생성해야 한다', async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue(null);
      mockPrismaService.restaurant.create.mockResolvedValue(mockRestaurant);

      const result = await service.create(dto);

      expect(result).toEqual(mockRestaurant);
    });

    it('kakaoPlaceId가 이미 존재하면 기존 식당을 반환해야 한다', async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue(mockRestaurant);

      const result = await service.create(dto);

      expect(result).toEqual(mockRestaurant);
      expect(mockPrismaService.restaurant.create).not.toHaveBeenCalled();
    });

    it('kakaoPlaceId 없이 생성해야 한다', async () => {
      const dtoWithoutKakao = { name: '맛집', address: '서울시' };
      mockPrismaService.restaurant.create.mockResolvedValue({
        ...mockRestaurant,
        kakaoPlaceId: null,
      });

      const result = await service.create(dtoWithoutKakao);

      expect(result).toBeDefined();
    });
  });

  describe('findById', () => {
    it('식당을 반환해야 한다', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      const result = await service.findById('restaurant-id');

      expect(result).toEqual(mockRestaurant);
    });

    it('존재하지 않는 식당이면 NotFoundException을 던져야 한다', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    it('검색 결과를 반환해야 한다', async () => {
      mockPrismaService.restaurant.findMany.mockResolvedValue([mockRestaurant]);

      const result = await service.search('맛집', 20);

      expect(result).toHaveLength(1);
      expect(mockPrismaService.restaurant.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: '맛집' } },
            { address: { contains: '맛집' } },
            { category: { contains: '맛집' } },
          ],
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByKakaoPlaceId', () => {
    it('카카오 Place ID로 식당을 찾아야 한다', async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue(mockRestaurant);

      const result = await service.findByKakaoPlaceId('kakao-123');

      expect(result).toEqual(mockRestaurant);
    });

    it('없으면 null을 반환해야 한다', async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue(null);

      const result = await service.findByKakaoPlaceId('invalid');

      expect(result).toBeNull();
    });
  });

  describe('findOrCreate', () => {
    const dto = {
      name: '맛집',
      kakaoPlaceId: 'kakao-123',
    };

    it('기존 식당이 있으면 반환해야 한다', async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue(mockRestaurant);

      const result = await service.findOrCreate(dto);

      expect(result).toEqual(mockRestaurant);
    });

    it('없으면 새로 생성해야 한다', async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue(null);
      mockPrismaService.restaurant.create.mockResolvedValue(mockRestaurant);

      const result = await service.findOrCreate(dto);

      expect(result).toEqual(mockRestaurant);
    });

    it('kakaoPlaceId 없이도 생성해야 한다', async () => {
      const dtoWithoutKakao = { name: '맛집' };
      mockPrismaService.restaurant.findFirst.mockResolvedValue(null);
      mockPrismaService.restaurant.create.mockResolvedValue(mockRestaurant);

      const result = await service.findOrCreate(dtoWithoutKakao);

      expect(result).toBeDefined();
    });
  });
});

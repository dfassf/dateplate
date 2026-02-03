import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

describe('RestaurantsController', () => {
  let controller: RestaurantsController;

  const mockRestaurantsService = {
    findOrCreate: jest.fn(),
    search: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [
        { provide: RestaurantsService, useValue: mockRestaurantsService },
      ],
    }).compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('식당을 생성해야 한다', async () => {
      const dto = { name: '맛집', address: '서울시' };
      const result = { id: 'restaurant-id', ...dto };
      mockRestaurantsService.findOrCreate.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockRestaurantsService.findOrCreate).toHaveBeenCalledWith(dto);
    });
  });

  describe('search', () => {
    it('식당을 검색해야 한다', async () => {
      const result = [{ id: 'restaurant-id', name: '맛집' }];
      mockRestaurantsService.search.mockResolvedValue(result);

      expect(await controller.search('맛집', '10')).toEqual(result);
      expect(mockRestaurantsService.search).toHaveBeenCalledWith('맛집', 10);
    });

    it('limit이 없으면 기본값 20을 사용해야 한다', async () => {
      mockRestaurantsService.search.mockResolvedValue([]);

      await controller.search('맛집', undefined);

      expect(mockRestaurantsService.search).toHaveBeenCalledWith('맛집', 20);
    });
  });

  describe('findById', () => {
    it('식당을 반환해야 한다', async () => {
      const result = { id: 'restaurant-id', name: '맛집' };
      mockRestaurantsService.findById.mockResolvedValue(result);

      expect(await controller.findById('restaurant-id')).toEqual(result);
      expect(mockRestaurantsService.findById).toHaveBeenCalledWith('restaurant-id');
    });
  });
});

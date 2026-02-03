import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto';
import { JwtAuthGuard } from '../common/guards';

@Controller('restaurants')
@UseGuards(JwtAuthGuard)
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Post()
  async create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.findOrCreate(dto);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    return this.restaurantsService.search(query, limit ? parseInt(limit, 10) : 20);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }
}

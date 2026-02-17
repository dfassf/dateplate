import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateRestaurantDto } from './dto/index.js';

@Controller('restaurants')
@UseGuards(JwtAuthGuard)
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Post()
  create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(dto);
  }

  @Get('rankings')
  findRankings(@Query('sort') sort?: string, @Query('category') category?: string) {
    return this.restaurantsService.findRankings(sort, category);
  }

  @Get('team/:teamId')
  findByTeam(@Param('teamId') teamId: string, @Query('sort') sort?: string) {
    return this.restaurantsService.findByTeam(teamId, sort);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.restaurantsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }
}

import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateReviewDto, UpdateReviewDto } from './dto/index.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto, user.id);
  }

  @Get()
  findByTeam(@Query('teamId') teamId: string, @Query() pagination: PaginationDto) {
    return this.reviewsService.findByTeam(teamId, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}

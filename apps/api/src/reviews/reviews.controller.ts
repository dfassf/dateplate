import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from './dto/index.js';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto, user.id);
  }

  @Get()
  findByTeam(@Query() query: ReviewQueryDto) {
    return this.reviewsService.findByTeam(query.teamId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.remove(id, user.id);
  }
}

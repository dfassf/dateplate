import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../common/types/current-user.type.js';
import { CreateReviewDto, ReviewQueryDto, UpdateReviewDto } from './dto/index.js';
import { ReviewsService } from './reviews.service.js';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto, user.id);
  }

  @Get('community')
  findCommunity(
    @Query('tag') tag?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findCommunity(tag, page ? +page : 1, limit ? +limit : 20);
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
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.reviewsService.remove(id, user.id);
  }
}

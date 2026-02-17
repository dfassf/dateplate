import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../common/types/current-user.type.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateDinnerDto, DinnerQueryDto, UpdateDinnerDto } from './dto/index.js';
import { DinnersService } from './dinners.service.js';

@Controller('dinners')
@UseGuards(JwtAuthGuard)
export class DinnersController {
  constructor(private dinnersService: DinnersService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateDinnerDto) {
    return this.dinnersService.create(dto, user.id);
  }

  @Get('recent')
  findRecent(@CurrentUser() user: CurrentUserPayload) {
    return this.dinnersService.findRecentByUser(user.id);
  }

  @Get()
  findByTeam(@Query() query: DinnerQueryDto) {
    return this.dinnersService.findByTeam(query.teamId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dinnersService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateDinnerDto,
  ) {
    return this.dinnersService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.dinnersService.remove(id, user.id);
  }
}

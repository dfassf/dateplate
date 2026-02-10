import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DinnersService } from './dinners.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateDinnerDto, UpdateDinnerDto, DinnerQueryDto } from './dto/index.js';

@Controller('dinners')
@UseGuards(JwtAuthGuard)
export class DinnersController {
  constructor(private dinnersService: DinnersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateDinnerDto) {
    return this.dinnersService.create(dto, user.id);
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
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateDinnerDto) {
    return this.dinnersService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dinnersService.remove(id, user.id);
  }
}

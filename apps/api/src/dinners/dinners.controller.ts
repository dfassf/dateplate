import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DinnersService } from './dinners.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateDinnerDto, UpdateDinnerDto } from './dto/index.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';

@Controller('dinners')
@UseGuards(JwtAuthGuard)
export class DinnersController {
  constructor(private dinnersService: DinnersService) {}

  @Post()
  create(@Body() dto: CreateDinnerDto) {
    return this.dinnersService.create(dto);
  }

  @Get()
  findByTeam(@Query('teamId') teamId: string, @Query() pagination: PaginationDto) {
    return this.dinnersService.findByTeam(teamId, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dinnersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDinnerDto) {
    return this.dinnersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dinnersService.remove(id);
  }
}

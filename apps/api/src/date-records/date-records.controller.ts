import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { DateRecordsService } from './date-records.service';
import { CreateDateRecordDto, UpdateDateRecordDto } from './dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@Controller('date-records')
@UseGuards(JwtAuthGuard)
export class DateRecordsController {
  constructor(private dateRecordsService: DateRecordsService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateDateRecordDto) {
    return this.dateRecordsService.create(user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dateRecordsService.findAll(
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  async findById(@CurrentUser() user: User, @Param('id') id: string) {
    return this.dateRecordsService.findById(user.id, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateDateRecordDto,
  ) {
    return this.dateRecordsService.update(user.id, id, dto);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.dateRecordsService.delete(user.id, id);
  }
}

import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../common/types/current-user.type.js';
import { CreateSessionDto, VoteDto } from './dto/index.js';
import { SessionsService } from './sessions.service.js';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(user.id, dto);
  }

  @Get()
  findByTeam(@Query('teamId') teamId: string, @Query('status') status?: string) {
    return this.sessionsService.findByTeam(teamId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findById(id);
  }

  @Post(':id/vote')
  vote(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: VoteDto,
  ) {
    return this.sessionsService.vote(id, user.id, dto);
  }

  @Post(':id/spin')
  spin(@Param('id') id: string) {
    return this.sessionsService.spin(id);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Body('result') result: string) {
    return this.sessionsService.complete(id, result);
  }
}

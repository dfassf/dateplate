import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get(':teamId')
  getTeamStats(@Param('teamId') teamId: string) {
    return this.statsService.getTeamStats(teamId);
  }
}

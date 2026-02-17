import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../common/types/current-user.type.js';
import { GiveTicketDto } from './dto/index.js';
import { GamificationService } from './gamification.service.js';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Post('tickets')
  giveTicket(@CurrentUser() user: CurrentUserPayload, @Body() dto: GiveTicketDto) {
    return this.gamificationService.giveTicket(user.id, dto);
  }

  @Get('tickets/:teamId')
  getTicketResults(
    @Param('teamId') teamId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.gamificationService.getTicketResults(
      teamId,
      month ? +month : undefined,
      year ? +year : undefined,
    );
  }

  @Get('achievements')
  getAchievements(@CurrentUser() user: CurrentUserPayload) {
    return this.gamificationService.getAchievements(user.id);
  }

  @Post('achievements/check')
  checkAchievements(@CurrentUser() user: CurrentUserPayload) {
    return this.gamificationService.checkAndUnlockAchievements(user.id);
  }

  @Get('missions')
  getMissions(@CurrentUser() user: CurrentUserPayload) {
    return this.gamificationService.getMissions(user.id);
  }
}

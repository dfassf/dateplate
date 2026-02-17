import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service.js';
import { GamificationController } from './gamification.controller.js';

@Module({
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}

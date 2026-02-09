import { Module } from '@nestjs/common';
import { DinnersService } from './dinners.service.js';
import { DinnersController } from './dinners.controller.js';

@Module({
  controllers: [DinnersController],
  providers: [DinnersService],
  exports: [DinnersService],
})
export class DinnersModule {}

import { Module } from '@nestjs/common';
import { DateRecordsController } from './date-records.controller';
import { DateRecordsService } from './date-records.service';

@Module({
  controllers: [DateRecordsController],
  providers: [DateRecordsService],
  exports: [DateRecordsService],
})
export class DateRecordsModule {}

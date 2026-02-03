import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class UpdateDateRecordDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}

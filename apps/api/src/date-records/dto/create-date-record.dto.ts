import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateDateRecordDto {
  @IsDateString()
  date: string;

  @IsString()
  restaurantId: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}

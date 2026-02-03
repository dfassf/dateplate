import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ReviewVisibility } from '@prisma/client';

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsEnum(ReviewVisibility)
  visibility?: ReviewVisibility;
}

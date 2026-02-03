import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewVisibility, ReviewImageType } from '@prisma/client';

class ReviewImageDto {
  @IsString()
  imageUrl: string;

  @IsEnum(ReviewImageType)
  type: ReviewImageType;
}

export class CreateReviewDto {
  @IsString()
  dateRecordId: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsEnum(ReviewVisibility)
  visibility?: ReviewVisibility;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewImageDto)
  images?: ReviewImageDto[];
}

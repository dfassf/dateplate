import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export * from './review-query.dto.js';

export class CreateReviewDto {
  @IsString()
  dinnerRecordId!: string;

  @IsString()
  restaurantId!: string;

  @IsString()
  teamId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsOptional()
  content?: string;

  @IsIn(['PRIVATE', 'COMMUNITY', 'PUBLIC'])
  @IsOptional()
  visibility?: 'PRIVATE' | 'COMMUNITY' | 'PUBLIC';
}

export class UpdateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  content?: string;

  @IsIn(['PRIVATE', 'COMMUNITY', 'PUBLIC'])
  @IsOptional()
  visibility?: 'PRIVATE' | 'COMMUNITY' | 'PUBLIC';
}

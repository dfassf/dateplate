import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  kakaoPlaceId?: string;
}

import { IsString, IsOptional, IsInt, IsDateString, Min } from 'class-validator';

export class CreateDinnerDto {
  @IsDateString()
  date!: string;

  @IsString()
  teamId!: string;

  @IsString()
  restaurantId!: string;

  @IsString()
  @IsOptional()
  memo?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  headcount?: number;
}

export class UpdateDinnerDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  memo?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  headcount?: number;
}

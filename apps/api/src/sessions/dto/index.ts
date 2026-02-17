import { IsString, IsOptional, IsIn, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class SessionOptionDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  restaurantId?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  weight?: number;
}

export class CreateSessionDto {
  @IsIn(['TOURNAMENT', 'ROULETTE'])
  type!: 'TOURNAMENT' | 'ROULETTE';

  @IsString()
  teamId!: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionOptionDto)
  options!: SessionOptionDto[];
}

export class VoteDto {
  @IsString()
  optionId!: string;

  @IsInt()
  @Min(1)
  round!: number;
}

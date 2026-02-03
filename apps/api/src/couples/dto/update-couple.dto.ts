import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCoupleDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  profileUrl?: string;
}

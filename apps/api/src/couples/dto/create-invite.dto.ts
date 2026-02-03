import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInviteDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  coupleName?: string;
}

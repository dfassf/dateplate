import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

export class UpdateTeamDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  profileUrl?: string;
}

export class AcceptInviteDto {
  @IsString()
  inviteCode!: string;
}

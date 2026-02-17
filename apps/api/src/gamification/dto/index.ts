import { IsString, IsIn } from 'class-validator';

export class GiveTicketDto {
  @IsString()
  toUserId!: string;

  @IsString()
  teamId!: string;

  @IsIn(['GOLDEN', 'BLACK'])
  type!: 'GOLDEN' | 'BLACK';
}

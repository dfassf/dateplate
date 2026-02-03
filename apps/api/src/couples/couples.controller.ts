import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CouplesService } from './couples.service';
import { CreateInviteDto, AcceptInviteDto, UpdateCoupleDto } from './dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@Controller('couples')
@UseGuards(JwtAuthGuard)
export class CouplesController {
  constructor(private couplesService: CouplesService) {}

  @Post('invite')
  async createInvite(@CurrentUser() user: User, @Body() dto: CreateInviteDto) {
    return this.couplesService.createInvite(user.id, dto);
  }

  @Post('accept')
  async acceptInvite(@CurrentUser() user: User, @Body() dto: AcceptInviteDto) {
    return this.couplesService.acceptInvite(user.id, dto);
  }

  @Get('me')
  async getMyCouple(@CurrentUser() user: User) {
    return this.couplesService.getMyCouple(user.id);
  }

  @Get('invite/pending')
  async getMyPendingInvite(@CurrentUser() user: User) {
    return this.couplesService.getMyPendingInvite(user.id);
  }

  @Patch(':id')
  async updateCouple(
    @CurrentUser() user: User,
    @Param('id') coupleId: string,
    @Body() dto: UpdateCoupleDto,
  ) {
    return this.couplesService.updateCouple(user.id, coupleId, dto);
  }
}

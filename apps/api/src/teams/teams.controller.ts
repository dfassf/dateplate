import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../common/types/current-user.type.js';
import { AcceptInviteDto, CreateTeamDto, UpdateTeamDto } from './dto/index.js';
import { TeamsService } from './teams.service.js';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(user.id, dto.name);
  }

  @Get()
  getMyTeams(@CurrentUser() user: CurrentUserPayload) {
    return this.teamsService.getMyTeams(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.teamsService.remove(id, user.id);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.teamsService.removeMember(id, memberId, user.id);
  }

  @Post(':id/invite')
  createInvite(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.teamsService.createInvite(id, user.id);
  }

  @Post('join')
  acceptInvite(@CurrentUser() user: CurrentUserPayload, @Body() dto: AcceptInviteDto) {
    return this.teamsService.acceptInvite(user.id, dto.inviteCode);
  }
}

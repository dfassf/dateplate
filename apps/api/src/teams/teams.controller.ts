import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateTeamDto, UpdateTeamDto, AcceptInviteDto } from './dto/index.js';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(user.id, dto.name);
  }

  @Get()
  getMyTeams(@CurrentUser() user: any) {
    return this.teamsService.getMyTeams(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamsService.remove(id, user.id);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
  ) {
    return this.teamsService.removeMember(id, memberId, user.id);
  }

  @Post(':id/invite')
  createInvite(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamsService.createInvite(id, user.id);
  }

  @Post('join')
  acceptInvite(@CurrentUser() user: any, @Body() dto: AcceptInviteDto) {
    return this.teamsService.acceptInvite(user.id, dto.inviteCode);
  }
}

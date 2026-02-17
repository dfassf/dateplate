import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../common/types/current-user.type.js';
import { UsersService } from './users.service.js';

interface UpdateProfileBody {
  name?: string;
  companyAddress?: string;
  companyLatitude?: number;
  companyLongitude?: number;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: CurrentUserPayload, @Body() body: UpdateProfileBody) {
    return this.usersService.updateProfile(user.id, body);
  }
}

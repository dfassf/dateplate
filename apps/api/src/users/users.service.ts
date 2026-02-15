import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async updateProfile(id: string, data: { name?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }
}

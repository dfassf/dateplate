import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async checkEmail(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    return { available: !existing };
  }

  async register(email: string, password: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('이미 존재하는 이메일입니다');
    }

    const hashedPassword = await argon2.hash(password);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    return this.toAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');
    }

    return this.toAuthResponse(user);
  }

  private toAuthResponse(user: User) {
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyAddress: user.companyAddress,
        companyLatitude: user.companyLatitude,
        companyLongitude: user.companyLongitude,
        createdAt: user.createdAt,
      },
    };
  }
}

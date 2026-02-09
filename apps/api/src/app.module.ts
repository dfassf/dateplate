import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { TeamsModule } from './teams/teams.module.js';
import { DinnersModule } from './dinners/dinners.module.js';
import { RestaurantsModule } from './restaurants/restaurants.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    DinnersModule,
    RestaurantsModule,
    ReviewsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common'
import { FriendsController } from './friends.controller'
import { FriendsService } from './friends.service'
import { PrismaService } from '../prisma/prisma.service'
import { JwtAuthModule } from '../auth/jwt/jwt-auth.module'
import { UsersModule } from '../users/users.module'
import { UsersService } from '../users/users.service'

@Module({
  providers: [FriendsService, PrismaService, UsersService],
  exports: [FriendsService],
  controllers: [FriendsController],
  imports: [JwtAuthModule, UsersModule],
})
export class FriendsModule {}

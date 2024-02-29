import { Module } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtAuthModule } from '../auth/jwt/jwt-auth.module'
import { UsersModule } from 'src/users/users.module'
import { FriendsService } from '../friends/friends.service'
import { FriendsModule } from '../friends/friends.module'
import { NotificationGateway } from './notification.gateway'
import { AuthService } from '../auth/auth.service'
import { StatusService } from 'src/status/status.service'

@Module({
  providers: [
    PrismaService,
    UsersService,
    FriendsService,
    NotificationGateway,
    AuthService,
    StatusService,
  ],
  imports: [JwtAuthModule, UsersModule, FriendsModule],
})
export class NotificationModule {}

import { Module } from '@nestjs/common'
import { GameController } from './game.controller'
import { GameService } from './game.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtAuthModule } from 'src/auth/jwt/jwt-auth.module'
import { UsersModule } from 'src/users/users.module'
import { GameGateway } from './game.gateways'
import { JwtAuthService } from 'src/auth/jwt/jwt-auth.service'
import { MessageService } from 'src/message/message.service'
import { ChannelService } from 'src/channel/channel.service'
import { AuthService } from 'src/auth/auth.service'
import { StatusService } from 'src/status/status.service'

@Module({
  controllers: [GameController],
  imports: [JwtAuthModule, UsersModule],
  providers: [
    GameService,
    PrismaService,
    GameGateway,
    JwtAuthService,
    MessageService,
    ChannelService,
    AuthService,
    StatusService,
  ],
})
export class GameModule {}

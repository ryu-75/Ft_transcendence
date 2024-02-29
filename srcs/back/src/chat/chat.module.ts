import { Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatController } from './chat.controller'
import { MessageService } from '../message/message.service'
import { PrismaService } from '../prisma/prisma.service'
import { ChannelService } from '../channel/channel.service'
import { ChatGateway } from './chat.gateway'
import { JwtAuthModule } from '../auth/jwt/jwt-auth.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  providers: [
    PrismaService,
    ChatService,
    MessageService,
    ChannelService,
    ChatGateway,
  ],
  controllers: [ChatController],
  imports: [JwtAuthModule, UsersModule],
})
export class ChatModule {}

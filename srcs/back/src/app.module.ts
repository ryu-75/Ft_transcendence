import { Logger, Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { ChatModule } from './chat/chat.module'
import { GameModule } from './game/game.module'
import { LoggerModule } from 'nestjs-pino'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { FriendsModule } from './friends/friends.module'
import { NotificationModule } from './notification/notification.module'
import { StatusService } from './status/status.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    LoggerModule.forRoot({}),
    UsersModule,
    AuthModule,
    ChatModule,
    FriendsModule,
    NotificationModule,
    GameModule,
  ],
  providers: [Logger, StatusService],
})
export class AppModule {
  constructor(configService: ConfigService) {
    const envs = [
      'DATABASE_URL',
      'CLIENT_ID',
      'CLIENT_SECRET',
      'FRONT_URL',
      'CALLBACK_URL',
      'AUTHORIZE_URL',
      'TOKEN_URL',
      'BASE_URL',
      'JWT_SECRET',
      'TWOFA_APP_NAME',
      'BACKEND_URL',
      'SALT',
    ]
    envs.forEach((env) => configService.getOrThrow(env))
  }
}

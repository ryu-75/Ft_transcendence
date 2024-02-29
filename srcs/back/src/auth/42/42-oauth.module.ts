import { Module } from '@nestjs/common'
import { FortyTwoOAuthController } from './42-oauth.controller'
import { UsersModule } from 'src/users/users.module'
import { HttpModule } from '@nestjs/axios'
import { FortyTwoOAuthStrategy } from './42-oauth.strategy'
import { JwtAuthModule } from '../jwt/jwt-auth.module'
import { AuthService } from '../auth.service'

@Module({
  imports: [UsersModule, HttpModule, JwtAuthModule],
  controllers: [FortyTwoOAuthController],
  providers: [FortyTwoOAuthStrategy, AuthService],
})
export class FortyTwoOAuthModule {}

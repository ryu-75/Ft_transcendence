import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { PassportModule } from '@nestjs/passport'
import { JwtAuthModule } from './jwt/jwt-auth.module'
import { AuthController } from './auth.controller'
import { FortyTwoOAuthModule } from './42/42-oauth.module'
import { TwoFaController } from './2fa/2fa.controller'
import { TwoFaAuthService } from './2fa/2fa.service'
import { AuthService } from './auth.service'

@Module({
  controllers: [AuthController, TwoFaController],
  providers: [TwoFaAuthService, AuthService],
  imports: [UsersModule, PassportModule, JwtAuthModule, FortyTwoOAuthModule],
  exports: [JwtAuthModule],
})
export class AuthModule {}

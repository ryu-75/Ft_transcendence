import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../../users/users.service'
import { JwtPayload } from './jwt-auth.strategy'
import { extractJwtFromCookie } from './utils/jwt-extrator'

@Injectable()
export class JwtTwoFaStrategy extends PassportStrategy(Strategy, 'jwt-two-fa') {
  constructor(
    configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.find({ id: payload.sub })
    if (!user) return null
    if (!user.twoFaEnabled) return user
    if (!payload.otp) throw new UnauthorizedException({ code: '2FA_REQUIRED' })
    return user
  }
}

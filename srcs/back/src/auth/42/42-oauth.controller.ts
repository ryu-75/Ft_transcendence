import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { FortyTwoOAuthGuard } from './42-oauth.guard'
import { JwtAuthService } from 'src/auth/jwt/jwt-auth.service'
import { UnauthorizedExceptionFilter } from './42-oauth.exceptionfilter'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'
import { RequestWithUser } from 'src/types/Request'

@Controller('auth/42')
export class FortyTwoOAuthController {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}
  @UseGuards(FortyTwoOAuthGuard)
  @Get()
  async auth() {}

  @UseGuards(FortyTwoOAuthGuard)
  @UseFilters(UnauthorizedExceptionFilter)
  @Get('callback')
  async callback(@Req() req: RequestWithUser, @Res() res: Response) {
    const user = await this.authService.getUser(
      req.user,
      req.user.accessToken,
      req.user.refreshToken,
    )
    if (!user) throw new UnauthorizedException('User not found')
    const jwt = await this.jwtAuthService.login(user)
    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    if (user.twoFaEnabled) {
      return res.redirect(
        `${this.configService.getOrThrow<string>('FRONT_URL')}/login/2fa`,
      )
    }
    res.redirect(this.configService.getOrThrow<string>('FRONT_URL'))
  }
}

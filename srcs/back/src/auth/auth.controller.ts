import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'
import JwtTwoFaGuard from './jwt/jwt-2fa.guard'
import { faker } from '@faker-js/faker'
import { UsersService } from 'src/users/users.service'
import { JwtAuthService } from './jwt/jwt-auth.service'
import { UserEntity } from 'src/users/entity/user.entity'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}
  @Get()
  async auth(@Res() res: Response) {
    return res.redirect('/auth/42')
  }

  @Get('logout')
  @UseGuards(JwtTwoFaGuard)
  async logout(@Res() res: Response) {
    res.clearCookie('jwt')
    res.json({ message: 'Logged out' })
  }

  @Post('dev')
  async loginDev(@Res() res: Response) {
    const user = await this.userService.create({
      email: faker.internet.email(),
      image: faker.image.avatar(),
      username: faker.internet.userName(),
    })
    if (!user)
      return res.redirect(
        this.configService.getOrThrow<string>('FRONT_URL') + '/login',
      )
    const jwt = await this.jwtAuthService.login(user)
    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    res.json({ message: 'Logged in', user: new UserEntity(user) })
  }
}

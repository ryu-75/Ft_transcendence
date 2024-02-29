import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { UsersService } from 'src/users/users.service'
import { IMe } from './42/42-oauth.types'
import { Socket } from 'socket.io'
import { parse } from 'cookie'
import { JwtAuthService } from './jwt/jwt-auth.service'
import { WsException } from '@nestjs/websockets'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtAuthService: JwtAuthService,
  ) { }

  async getUser(user: IMe | User, accessToken: string, refreshToken: string) {
    if ('id' in user) return this.userService.find({ id: user.id })
    return this.userService.findOrCreate(
      { email: user.email },
      {
        email: user.email,
        username: user.login,
        image: user.image.link,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    )
  }

  async getSocketUser(socket: Socket) {
    const jwtCookie = socket.handshake.headers.cookie
    if (!jwtCookie) return null
    const parsed = parse(jwtCookie)
    if (!parsed.jwt) return null
    try {
      const jwt = await this.jwtAuthService.verify(parsed.jwt)
      if (!jwt || !jwt.sub) return null
      const user = await this.userService.find({ id: jwt.sub })
      if (!user) return null
      return user
    } catch (e) {
      throw new WsException('Invalid token')
    }
  }
}

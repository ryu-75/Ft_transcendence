import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from './jwt-auth.strategy'

import { User } from '@prisma/client'

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: User, is2FaOk: boolean = false) {
    const payload: JwtPayload = {
      sub: user.id,
      otp: is2FaOk,
    }
    return this.jwtService.signAsync(payload)
  }

  async verify(token: string) {
    return this.jwtService.verifyAsync<JwtPayload>(token)
  }
}

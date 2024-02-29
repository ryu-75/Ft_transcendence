import { Injectable } from '@nestjs/common'
import { authenticator } from 'otplib'
import { toFileStream } from 'qrcode'
import { UsersService } from '../../users/users.service'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { Response } from 'express'

@Injectable()
export class TwoFaAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async generate2faSecret(user: { email: string; id: number }) {
    const secret = authenticator.generateSecret()

    const otpauthUrl = authenticator.keyuri(
      user.email,
      this.configService.getOrThrow('TWOFA_APP_NAME'),
      secret,
    )

    await this.usersService.update({
      where: { id: user.id },
      data: { twoFaSecret: secret, twoFaEnabled: false },
    })

    return {
      secret,
      otpauthUrl,
    }
  }

  async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl)
  }

  async is2FaCodeValid(user: User, code: string) {
    return authenticator.verify({
      token: code,
      secret: user.twoFaSecret ?? '',
    })
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class FortyTwoOAuthGuard extends AuthGuard('42') {
  configservice: ConfigService
  constructor(configService: ConfigService) {
    super()
    this.configservice = configService
  }
  handleRequest(err: any, user: any) {
    if (err || !user) throw new UnauthorizedException()
    return user
  }
}

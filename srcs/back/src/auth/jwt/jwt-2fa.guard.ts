import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export default class JwtTwoFaGuard extends AuthGuard('jwt-two-fa') {
  getRequest(context: ExecutionContext) {
    switch (context.getType()) {
      case 'ws':
        return context.switchToWs().getClient().handshake
      default:
        return context.switchToHttp().getRequest()
    }
  }
}

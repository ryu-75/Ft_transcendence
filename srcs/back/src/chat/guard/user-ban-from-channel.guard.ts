import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'

import { ChannelService } from 'src/channel/channel.service'
import { RequestWithDbUser } from 'src/types/Request'

@Injectable()
export class UserIsNotBanFromChannelGuard implements CanActivate {
  logger = new Logger('UserIsNotBanFromChannelGuard')

  constructor(private readonly channelService: ChannelService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    switch (context.getType()) {
      case 'ws':
        return await this.canActivateWs(context)
      case 'http':
        return await this.canActivateHttp(context)
      default:
        return false
    }
  }

  async canActivateWs(context: ExecutionContext) {
    const data: {
      channelId: string
    } = context.switchToWs().getData()
    const userId = context.switchToWs().getClient().handshake.user.id
    const banned = await this.channelService.isUserBanFromChannel(
      data.channelId,
      userId,
    )
    return !banned
  }

  async canActivateHttp(context: ExecutionContext) {
    const request: RequestWithDbUser = context.switchToHttp().getRequest()
    const banned = await this.channelService.isUserBanFromChannel(
      request.params.id,
      request.user.id,
    )

    return !banned
  }
}

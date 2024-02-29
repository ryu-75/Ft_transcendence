import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

import { ChannelService } from 'src/channel/channel.service'

@Injectable()
export class UserIsPresentGuard implements CanActivate {
  constructor(private readonly channelService: ChannelService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const channelId = request.params.id
    const userId = request.user.id
    const isPresent = await this.channelService.isUserPresentInChannel(
      channelId,
      userId,
    )

    return isPresent
  }
}

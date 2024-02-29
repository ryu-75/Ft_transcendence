import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

import { ChannelService } from 'src/channel/channel.service'

@Injectable()
export class UserIsAdminOrOwner implements CanActivate {
  constructor(private readonly channelService: ChannelService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = await this.channelService.isUserOwnerOrAdminOfChannel(
      context.switchToHttp().getRequest().params.id,
      context.switchToHttp().getRequest().user.id,
    )
    return !!ok
  }
}

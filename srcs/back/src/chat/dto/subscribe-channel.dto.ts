import { IsNotEmpty, IsUUID } from 'class-validator'

export class SubscribeChannelDto {
  @IsUUID()
  @IsNotEmpty()
  channelId: string
}

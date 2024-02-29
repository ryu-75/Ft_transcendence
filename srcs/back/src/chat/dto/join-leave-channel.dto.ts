import { IsNotEmpty, IsUUID } from 'class-validator'

export class JoinLeaveChannelDto {
  @IsUUID()
  @IsNotEmpty()
  channelId: string
}

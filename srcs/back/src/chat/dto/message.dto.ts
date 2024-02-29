import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class MessageDto {
  @IsUUID()
  @IsNotEmpty()
  channelId: string

  @IsNotEmpty()
  @IsString()
  content: string

  @IsBoolean()
  gameInvite: boolean
}
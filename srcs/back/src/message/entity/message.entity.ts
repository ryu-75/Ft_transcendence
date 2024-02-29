import { ChannelMessage as PrismaChannelMessage } from '@prisma/client'

export class ChannelMessageEntity implements PrismaChannelMessage {
  id: number
  content: string
  channelId: string
  senderId: number
  gameInvite: boolean
  createdAt: Date
  deletedAt: Date | null
  updatedAt: Date

  constructor(partial: Partial<ChannelMessageEntity>) {
    Object.assign(this, partial)
  }
}

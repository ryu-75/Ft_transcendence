import { Exclude } from 'class-transformer'
import { ChannelAction as PrismaChannelAction } from '@prisma/client'

export class ChannelActionEntity implements PrismaChannelAction {
  channelId: string
  userId: number

  @Exclude()
  createdAt: Date
  @Exclude()
  deletedAt: Date | null
  @Exclude()
  updatedAt: Date

  constructor(partial: Partial<ChannelActionEntity>) {
    Object.assign(this, partial)
  }
}

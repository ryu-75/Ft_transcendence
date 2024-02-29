import { Exclude, Type } from 'class-transformer'
import { $Enums, Channel as PrismaChannel } from '@prisma/client'
import { ChannelMemberEntity } from './membership.entity'
import { ChannelActionEntity } from './action.entity'
import { ChannelMessageEntity } from '../../message/entity/message.entity'

export class ChannelEntity implements PrismaChannel {
  id: string
  name: string | null
  type: $Enums.ChannelType
  ownerId: number | null
  isPrivate: boolean

  @Type(() => ChannelEntity)
  members: ChannelMemberEntity[]

  @Type(() => ChannelEntity)
  actions: ChannelActionEntity[]

  @Type(() => ChannelEntity)
  messages: ChannelMessageEntity[]

  createdAt: Date
  deletedAt: Date | null
  updatedAt: Date

  @Exclude()
  password: string | null

  constructor(partial: Partial<ChannelEntity>) {
    Object.assign(this, partial)
  }
}

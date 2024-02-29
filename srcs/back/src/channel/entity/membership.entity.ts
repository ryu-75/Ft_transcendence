import { Exclude, Type } from 'class-transformer'
import { $Enums, ChannelMember as PrismaChannelMember } from '@prisma/client'
import { UserEntity } from 'src/users/entity/user.entity'

export class ChannelMemberEntity implements PrismaChannelMember {
  userId: number
  role: $Enums.Role
  channelId: string
  present: boolean
  @Type(() => ChannelMemberEntity)
  user: UserEntity

  @Exclude()
  createdAt: Date
  @Exclude()
  updatedAt: Date
  @Exclude()
  deletedAt: Date | null
  constructor(partial: Partial<ChannelMemberEntity>) {
    Object.assign(this, partial)
  }
}

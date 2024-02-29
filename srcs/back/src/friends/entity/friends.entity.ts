import { Exclude } from 'class-transformer'
import { Friends as FriendPrisma } from '@prisma/client'

export class FriendEntity implements FriendPrisma {
  friendId: number
  friendOfId: number
  confirmed: boolean

  @Exclude()
  createdAt: Date
  @Exclude()
  deletedAt: Date | null
  @Exclude()
  expiresAt: Date | null
  @Exclude()
  updatedAt: Date

  constructor(partial: Partial<FriendEntity>) {
    Object.assign(this, partial)
  }
}

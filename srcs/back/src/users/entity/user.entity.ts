import { Exclude } from 'class-transformer'
import { User as UserPrisma } from '@prisma/client'

export class UserEntity implements UserPrisma {
  id: number
  email: string
  username: string
  image: string
  createdAt: Date
  updatedAt: Date
  twoFaEnabled: boolean
  elo: number

  @Exclude()
  deletedAt: Date | null
  @Exclude()
  expiresAt: Date | null
  @Exclude()
  accessToken: string | null
  @Exclude()
  refreshToken: string | null
  @Exclude()
  twoFaSecret: string | null
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial)
  }
}

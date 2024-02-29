import { Game } from '@prisma/client'
import { Type } from 'class-transformer'
import { UserEntity } from 'src/users/entity/user.entity'

export class GameEntity implements Game {
  exchangeCount: number
  gametype: string | null

  id: number
  participant1Id: number
  @Type(() => UserEntity)
  participant1: UserEntity
  @Type(() => UserEntity)
  participant2: UserEntity
  participant2Id: number
  scoreP1: number | null
  scoreP2: number | null
  winner_id: number | null
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<GameEntity>) {
    Object.assign(this, partial)
  }
}

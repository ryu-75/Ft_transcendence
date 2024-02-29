import { Transform } from 'class-transformer'
import { IsNumber, IsNotEmpty, NotEquals } from 'class-validator'
import { User } from '@prisma/client'

export class FriendshipRemovalDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  friendOfId: number
}

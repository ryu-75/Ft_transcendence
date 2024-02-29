import { BlockList } from '@prisma/client'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class BlockUserDto implements Partial<BlockList> {
  @IsNotEmpty()
  @IsNumber()
  userId: number
}

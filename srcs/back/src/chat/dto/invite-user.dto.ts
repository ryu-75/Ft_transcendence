import { Transform } from 'class-transformer'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class InviteUserDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  userId: number
}

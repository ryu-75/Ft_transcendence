import { IsNotEmpty, IsNumber } from 'class-validator'

export class UserActionDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number
}

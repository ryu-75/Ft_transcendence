import { IsNumber } from 'class-validator'

export class CreatePmDto {
  @IsNumber()
  targetId: number
}

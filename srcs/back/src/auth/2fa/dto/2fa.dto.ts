import { IsNotEmpty, IsString } from 'class-validator'

export class TwoFaAuthCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string
}

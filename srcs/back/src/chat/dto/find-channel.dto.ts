import { IsNotEmpty, IsString } from 'class-validator'

export class FindChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string
}

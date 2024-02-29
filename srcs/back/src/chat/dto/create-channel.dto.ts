import { Channel, ChannelType } from '@prisma/client'
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

// @TODO - this doesnt work if password is ""
// revoir les checks sur les password/names
export class CreateChannelDto implements Partial<Channel> {
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  name: string

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  password: string | undefined

  @IsEnum(ChannelType)
  @IsNotEmpty()
  type: ChannelType

  @IsOptional()
  @IsNumber()
  targetId: number | undefined
}

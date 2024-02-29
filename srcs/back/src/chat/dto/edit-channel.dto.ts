import { Channel, ChannelType } from '@prisma/client'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

// @TODO - this doesnt work if password is ""
// revoir les checks sur les password/names
export class EditChannelDto implements Partial<Channel> {
  @IsString()
  id: string

  @IsString()
  @MinLength(3)
  @MaxLength(10)
  name: string

  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(10)
  password: string | undefined

  @IsEnum(ChannelType)
  @IsNotEmpty()
  type: ChannelType
}

import { Transform } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'

export class QueryUsersDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  skip: number

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  take: number
}

export class QueryFindUsersDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  take: number
}

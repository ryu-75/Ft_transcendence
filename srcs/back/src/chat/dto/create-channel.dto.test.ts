import { validate } from 'class-validator'
import { CreateChannelDto } from './create-channel.dto'
import { plainToInstance } from 'class-transformer'
import { ChannelType } from '@prisma/client'

describe('CreateChannelDto', () => {
  it('should be valid when all properties are provided', async () => {
    const data = {
      name: 'test',
      password: 'test',
      type: ChannelType.public,
    }
    const dto = plainToInstance(CreateChannelDto, data)
    const errors = await validate(dto)
    expect(errors.length).toEqual(0)
  })

  it('should be valid when only required properties are provided', async () => {
    const data = {
      type: ChannelType.public,
    }
    const dto = plainToInstance(CreateChannelDto, data)
    const errors = await validate(dto)
    expect(errors.length).toEqual(0)
  })

  it('should be invalid when name is too short', async () => {
    const data = {
      name: 'te',
      password: 'test',
      type: ChannelType.public,
    }
    const dto = plainToInstance(CreateChannelDto, data)
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('should be invalid when name is too long', async () => {
    const data = {
      name: 'testtesttesttest',
      password: 'test',
      type: ChannelType.public,
    }
    const dto = plainToInstance(CreateChannelDto, data)
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('should be invalid when password is too short', async () => {
    const data = {
      name: 'test',
      password: 'te',
      type: ChannelType.public,
    }
    const dto = plainToInstance(CreateChannelDto, data)
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('should be invalid when password is too long', async () => {
    const data = {
      name: 'test',
      password: 'testtesttesttest',
      type: ChannelType.public,
    }
    const dto = plainToInstance(CreateChannelDto, data)
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('should be invalid when type is not provided', async () => {
    const data = {
      name: 'test',
      password: 'test',
    }
    const dto = plainToInstance(CreateChannelDto, data)
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('CreateChannelDto', () => {
  it('should be valid', async () => {
    const data = {
      name: 'test',
      password: 'test',
      type: ChannelType.public,
    }
    const dto = plainToInstance(CreateChannelDto, data)
    const errors = await validate(dto)
    expect(errors.length).toEqual(0)
  })
})

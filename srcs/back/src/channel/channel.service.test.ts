// import { BadRequestException } from '@nestjs/common'
// import { PrismaService } from '../prisma/prisma.service'
// import { ChannelService } from './channel.service'
// import { Channel, ChannelType } from '@prisma/client'
// import { Test, TestingModule } from '@nestjs/testing'

// describe('ChannelService', () => {
//   let channelService: ChannelService
//   let prismaService: PrismaService

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [PrismaService],
//     }).compile()

//     prismaService = module.get(PrismaService)
//     channelService = new ChannelService(prismaService)
//   })

//   afterEach(() => {
//     jest.clearAllMocks()
//   })

//   describe('createChannel', () => {
//     it('should create a channel with all properties provided', async () => {
//       // Arrange
//       const name = 'test'
//       const password = 'test'
//       const type = ChannelType.protected
//       const userId = 1

//       const createChannelDto = {
//         name,
//         password,
//         type,
//         userId,
//       }

//       const expectedChannel: Channel = {
//         id: '1',
//         name,
//         password: expect.any(String),
//         type,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         deletedAt: null,
//         ownerId: userId,
//       }

//       jest
//         .spyOn(prismaService.channel, 'create')
//         .mockResolvedValue(expectedChannel)

//       // Act
//       const result = await channelService.createChannel(createChannelDto)

//       // Assert
//       expect(prismaService.channel.create).toHaveBeenCalledWith({
//         data: {
//           name,
//           type,
//           password: expect.any(String),
//           owner: {
//             connect: {
//               id: userId,
//             },
//           },
//           members: {
//             create: {
//               userId,
//             },
//           },
//         },
//       })
//       expect(result).toEqual(expectedChannel)
//     })

//     it('should create a channel without password', async () => {
//       // Arrange
//       const name = 'test'
//       const type = ChannelType.public
//       const userId = 1

//       const createChannelDto = {
//         name,
//         type,
//         userId,
//       }

//       const expectedChannel = {
//         id: 1,
//         name,
//         password: undefined,
//         type,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         deletedAt: null,
//         ownerId: userId,
//       } as unknown as Channel

//       jest
//         .spyOn(prismaService.channel, 'create')
//         .mockResolvedValue(expectedChannel)

//       // Act
//       const result = await channelService.createChannel(createChannelDto)

//       // Assert
//       expect(prismaService.channel.create).toHaveBeenCalledWith({
//         data: {
//           name,
//           type,
//           password: undefined,
//           owner: {
//             connect: {
//               id: userId,
//             },
//           },
//           members: {
//             create: {
//               userId,
//             },
//           },
//         },
//       })
//       expect(result).toEqual(expectedChannel)
//     })

//     it('should throw BadRequestException for public channels with passwords', async () => {
//       // Arrange
//       const name = 'test'
//       const password = 'test'
//       const type = ChannelType.public
//       const userId = 1

//       const createChannelDto = {
//         name,
//         password,
//         type,
//         userId,
//       }

//       // Act & Assert
//       await expect(
//         channelService.createChannel(createChannelDto),
//       ).rejects.toThrow(BadRequestException)
//     })

//     it('should throw BadRequestException for private channels with passwords', async () => {
//       // Arrange
//       const name = 'test'
//       const password = 'test'
//       const type = ChannelType.private
//       const userId = 1

//       const createChannelDto = {
//         name,
//         password,
//         type,
//         userId,
//       }

//       // Act & Assert
//       await expect(
//         channelService.createChannel(createChannelDto),
//       ).rejects.toThrow(BadRequestException)
//     })
//   })
// })

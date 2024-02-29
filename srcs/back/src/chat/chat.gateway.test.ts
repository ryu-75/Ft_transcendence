import { Socket } from 'socket.io'
import { ChatGateway } from './chat.gateway'
import { JwtAuthService } from '../auth/jwt/jwt-auth.service'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { PrismaService } from '../prisma/prisma.service'
import { MessageService } from '../message/message.service'
import { ChannelService } from 'src/channel/channel.service'

describe('ChatGateway', () => {
  // jest.autoMockOn()
  // let chatGateway: ChatGateway
  // let jwtAuthService: JwtAuthService
  // let userService: UsersService
  // let channelService: ChannelService
  // let messageService: MessageService
  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       JwtAuthService,
  //       JwtService,
  //       UsersService,
  //       PrismaService,
  //       MessageService,
  //     ],
  //   }).compile()
  //   jwtAuthService = module.get<JwtAuthService>(JwtAuthService)
  //   userService = module.get<UsersService>(UsersService)
  //   channelService = module.get<ChannelService>(ChannelService)
  //   messageService = module.get<MessageService>(MessageService)
  //   chatGateway = new ChatGateway(
  //     jwtAuthService,
  //     messageService,
  //     channelService,
  //     userService,
  //   )
  // })
  // describe('getUser', () => {
  //   it('should return null if jwtCookie is not provided', async () => {
  //     const socket: Socket = {
  //       handshake: {
  //         headers: {
  //           cookie: undefined,
  //         },
  //         query: {
  //           user: 'testUser',
  //         },
  //       },
  //     } as unknown as Socket
  //     const result = await chatGateway.getUser(socket)
  //     expect(result).toBeNull()
  //   })
  //   it('should return null if jwtCookie does not contain jwt', async () => {
  //     const socket: Socket = {
  //       handshake: {
  //         headers: {
  //           cookie: 'someCookie=123',
  //         },
  //         query: {
  //           user: 'testUser',
  //         },
  //       },
  //     } as unknown as Socket
  //     const result = await chatGateway.getUser(socket)
  //     expect(result).toBeNull()
  //   })
  //   it('should return user from socket.handshake.query', async () => {
  //     jwtAuthService.verify = jest.fn().mockResolvedValue('123')
  //     userService.find = jest.fn().mockResolvedValue('testUser')
  //     const socket: Socket = {
  //       handshake: {
  //         headers: {
  //           cookie: 'jwt=123',
  //         },
  //       },
  //     } as unknown as Socket
  //     const result = await chatGateway.getUser(socket)
  //     expect(result).toEqual('testUser')
  //   })
  // })
})

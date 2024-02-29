import { Logger, UseFilters, UseGuards, ValidationPipe } from '@nestjs/common'
import {
  BaseWsExceptionFilter,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { MessageService } from '../message/message.service'
import { ChannelService } from '.././channel/channel.service'
import { MessageDto } from './dto/message.dto'
import { Server } from 'socket.io'
import { ChatSocketEvent } from './types/ChatEvent'
import { UserIsNotBanFromChannelGuard } from './guard/user-ban-from-channel.guard'
import JwtTwoFaGuard from 'src/auth/jwt/jwt-2fa.guard'
import { ChannelType, User } from '@prisma/client'
import { parse } from 'cookie'
import { JwtAuthService } from 'src/auth/jwt/jwt-auth.service'
import { UsersService } from 'src/users/users.service'
import { OnEvent } from '@nestjs/event-emitter'
import {
  ChannelBanEvent,
  ChannelJoinedEvent,
  ChannelKickEvent,
  ChannelLeftEvent,
  ChannelEditEvent,
} from './events/channel.event'

type SocketWithUser = Socket & { handshake: { user: User } }

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: process.env.FRONT_URL ?? 'http://localhost:3001',
    credentials: true,
  },
})
@UseGuards(JwtTwoFaGuard)
@UseFilters(new BaseWsExceptionFilter())
export class ChatGateway {
  private readonly logger = new Logger('ChatGateway')

  @WebSocketServer() socket: Server
  userSockets = new Map<number, Socket>()
  socketUsers = new Map<string, number>()

  constructor(
    private readonly messageService: MessageService,
    private readonly channelService: ChannelService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(UserIsNotBanFromChannelGuard)
  @SubscribeMessage(ChatSocketEvent.MESSAGE)
  async handleMessage(
    @ConnectedSocket() socket: SocketWithUser,
    @MessageBody(new ValidationPipe()) messageDto: MessageDto,
  ) {
    const msg = await this.messageService.saveChannelMessage(
      socket.handshake.user.id,
      messageDto.channelId,
      messageDto.content,
      messageDto.gameInvite,
    )
    if (!msg) return
    const channel = await this.channelService.getChannel(
      messageDto.channelId,
      {},
    )
    if (channel?.type === ChannelType.direct) {
      await Promise.all(
        channel?.members
          .filter((member) => member.present === false)
          .map((member) => {
            this.emitUserJoinChannel(
              new ChannelJoinedEvent(messageDto.channelId, member.userId, true),
            )
            return this.channelService.joinChannel(
              member.userId,
              messageDto.channelId,
            )
          }),
      )
    }

    socket.to(messageDto.channelId).emit(ChatSocketEvent.MESSAGE, msg)
    this.logger.log(`Client sent message: ${socket.id}`)
  }

  @SubscribeMessage(ChatSocketEvent.UPDATE)
  async handleUpdateMessage(
    @ConnectedSocket() socket: SocketWithUser,
    @MessageBody() data: { messageId: number, channelId: string, content: string },
  ) {
    try {
        // Suppression du message dans la base de données
        const deletionResult = await this.messageService.deleteMessage(data.messageId);
    
        if (deletionResult) {
          // Si le message a été supprimé avec succès
          // Envoyer une notification ou un message de succès aux clients concernés
          socket.to(data.channelId).emit(ChatSocketEvent.MESSAGE_DELETED, { content: data.content, channelId: data.channelId });
          this.logger.log(`Message deleted: ${data.messageId}`);
        } else {
          // Gérer le cas où la suppression n'a pas fonctionné
          this.logger.error(`Failed to delete message: ${data.messageId}`);
        }
      } catch (error) {
        // Gérer les exceptions
        this.logger.error(`Error deleting message: ${data.messageId}`, error);
      }
  }
  @OnEvent(ChannelJoinedEvent.name)
  emitUserJoinChannel({ channelId, userId, background }: ChannelJoinedEvent) {
    this.getSocketByUserId(userId)?.join(channelId)
    this.socket.to(channelId).emit(ChatSocketEvent.JOIN_CHANNEL, {
      channelId,
      userId,
      background,
    })
  }

  /**
   * Emits a user leave channel event to the specified channel.
   * @param {ChannelLeftEvent | ChannelKickEvent | ChannelBanEvent} event - The event object containing the channel ID and user ID.
   */
  @OnEvent(ChannelLeftEvent.name)
  @OnEvent(ChannelKickEvent.name)
  @OnEvent(ChannelBanEvent.name)
  emitUserLeaveChannel({
    channelId,
    userId,
  }: ChannelLeftEvent | ChannelKickEvent | ChannelBanEvent) {
    this.socket.to(channelId).emit(ChatSocketEvent.LEAVE_CHANNEL, {
      channelId,
      userId,
    })
    this.getSocketByUserId(userId)?.leave(channelId)
  }

  @OnEvent(ChannelEditEvent.name)
  emitEditChannelApplyed({ channelId }: ChannelEditEvent) {
    this.socket.to(channelId).emit(ChatSocketEvent.EDIT_CHANNEL, {
      channelId,
    })
  }

  @SubscribeMessage(ChatSocketEvent.SUBSCRIBE)
  async subAll(@ConnectedSocket() socket: SocketWithUser) {
    const user = await this.getUser(socket)
    if (!user) return
    const usersChannels = await this.channelService.getMyChannels(user.id)
    socket.join(usersChannels.map((channel) => channel.id))
    usersChannels.forEach((channel) =>
      socket.emit(ChatSocketEvent.CONNECTED, {
        channelId: channel.id,
        userId: user.id,
      }),
    )
    socket.emit(ChatSocketEvent.CONNECTED, { userId: user.id })
    this.addSocketToUser(user.id, socket)
  }

  @SubscribeMessage(ChatSocketEvent.UNSUBSCRIBE)
  async unsubAll(@ConnectedSocket() socket: SocketWithUser) {
    const user = await this.getUser(socket)
    if (!user) return
    const usersChannels = await this.channelService.getMyChannels(user.id)
    usersChannels.forEach((channel) => {
      socket.to(channel.id).emit(ChatSocketEvent.DISCONNECTED, {
        channelId: channel.id,
        userId: user.id,
      })
      socket.leave(channel.id)
    })
    socket.emit(ChatSocketEvent.DISCONNECTED, { userId: user.id })
    this.removeSocketFromUser(user.id, socket.id)
  }

  /**
   * Adds a socket to a user.
   *
   * @param userId - The ID of the user.
   * @param socketId - The ID of the socket.
   */
  private addSocketToUser(userId: number, socket: Socket) {
    this.userSockets.set(userId, socket)
    this.socketUsers.set(socket.id, userId)
  }

  /**
   * Removes a socket from a user.
   * @param userId - The ID of the user.
   * @param socketId - The ID of the socket.
   */
  private removeSocketFromUser(userId: number, socketId: string) {
    this.userSockets.delete(userId)
    this.socketUsers.delete(socketId)
  }

  /**
   * Retrieves the socket associated with the given user ID.
   * @param userId - The ID of the user.
   * @returns The socket associated with the user ID, or undefined if not found.
   */
  getSocketByUserId(userId: number) {
    return this.userSockets.get(userId)
  }

  /**
   * Retrieves the user ID associated with a given socket ID.
   * @param socketId The socket ID to retrieve the user ID for.
   * @returns The user ID associated with the given socket ID.
   */
  getUserIdBySocketId(socketId: string) {
    return this.socketUsers.get(socketId)
  }

  async getUser(socket: Socket) {
    const jwtCookie = socket.handshake.headers.cookie
    if (!jwtCookie) return null
    const parsed = parse(jwtCookie)
    if (!parsed.jwt) return null
    try {
      const jwt = await this.jwtAuthService.verify(parsed.jwt)
      if (!jwt || !jwt.sub) return null
      const user = await this.userService.find({ id: jwt.sub })
      if (!user) return null
      return user
    } catch (e) {
      throw new WsException('Invalid token')
    }
  }
}

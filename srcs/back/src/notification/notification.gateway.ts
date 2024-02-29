import { Socket, Server } from 'socket.io'
import { AuthService } from '../auth/auth.service'
import { OnEvent } from '@nestjs/event-emitter'
import {
  FriendRequestEvent,
  StatusChangeEvent,
} from './events/notification.event'
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets'
import { Status } from '../status/types/Status'
import { StatusService } from 'src/status/status.service'

export enum NotificationEvent {
  REFRESH = 'refresh',
  STATUS_CHANGE = 'status_change',
  GET_STATUS = 'get_status',
}

@WebSocketGateway({
  namespace: 'notification',
  cors: {
    origin: process.env.FRONT_URL ?? 'http://localhost:3001',
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() socket: Server
  userSockets = new Map<number, Socket>()
  socketUsers = new Map<string, number>()

  constructor(
    private readonly authService: AuthService,
    private readonly statusService: StatusService,
  ) {}

  @OnEvent(FriendRequestEvent.name)
  async sentFriendRequest({ friendOfId }: FriendRequestEvent) {
    this.getSocketByUserId(friendOfId)?.emit(NotificationEvent.REFRESH)
  }

  @SubscribeMessage(NotificationEvent.GET_STATUS)
  async getStatus(client: Socket) {
    for (const [id, status] of this.statusService.getAllStatus()) {
      client.emit(NotificationEvent.STATUS_CHANGE, {
        userId: id,
        status,
      })
    }
  }

  async handleConnection(socket: Socket) {
    const user = await this.authService.getSocketUser(socket)
    if (!user) {
      socket.disconnect()
      return
    }
    this.addSocketToUser(user.id, socket)
    this.statusService.setStatus(user.id, Status.ONLINE)
    for (const [id, status] of this.statusService.getAllStatus())
      this.sendStatus(new StatusChangeEvent(id, status))
  }

  async handleDisconnect(socket: Socket) {
    const user = await this.authService.getSocketUser(socket)
    if (!user) {
      socket.disconnect()
      return
    }
    this.statusService.setStatus(user.id, Status.OFFLINE)
    for (const [id, status] of this.statusService.getAllStatus())
      this.sendStatus(new StatusChangeEvent(id, status))
  }

  getSocketByUserId(userId: number) {
    return this.userSockets.get(userId)
  }

  private addSocketToUser(userId: number, socket: Socket) {
    this.userSockets.set(userId, socket)
    this.socketUsers.set(socket.id, userId)
  }

  private removeSocketFromUser(userId: number, socketId: string) {
    this.userSockets.delete(userId)
    this.socketUsers.delete(socketId)
  }

  @OnEvent(StatusChangeEvent.name)
  private sendStatus({ userId, newStatus }: StatusChangeEvent) {
    this.socket.emit(NotificationEvent.STATUS_CHANGE, {
      userId,
      status: newStatus,
    })
  }
}

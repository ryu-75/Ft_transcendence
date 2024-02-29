import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
  ForbiddenException,
} from '@nestjs/common'

import JwtTwoFaGuard from '../auth/jwt/jwt-2fa.guard'
import { RequestWithDbUser } from '../types/Request'
import { ChannelService } from '../channel/channel.service'
import { ChannelEntity } from '../channel/entity/channel.entity'
import { CreateChannelDto } from './dto/create-channel.dto'
import { EditChannelDto } from './dto/edit-channel.dto'
import { CreatePmDto } from './dto/create-pm.dto'
import { UserActionDto } from './dto/user-action.dto'
import { UserIsNotBanFromChannelGuard } from './guard/user-ban-from-channel.guard'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
  ChannelBanEvent,
  ChannelJoinedEvent,
  ChannelKickEvent,
  ChannelLeftEvent,
  ChannelMutedEvent,
  ChannelEditEvent,
} from './events/channel.event'
import { UserIsAdminOrOwner } from './guard/user-admin-owner.guard'
import { UserIsPresentGuard } from './guard/user-is-present.guard'
import { Role } from '@prisma/client'
import { UserEntity } from 'src/users/entity/user.entity'
import { InviteUserDto } from './dto/invite-user.dto'

@Controller('chat')
@UseGuards(JwtTwoFaGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ChatController {
  constructor(
    private readonly channelService: ChannelService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get('/channels')
  async getNotJoinedChannels(@Req() req: RequestWithDbUser) {
    const channels = await this.channelService.getNotJoinedVisibleChannels(
      req.user.id,
    )
    if (!channels) return []
    return channels.map((channel) => new ChannelEntity(channel))
  }

  @Get('/channels/mine')
  async getChannels(@Req() req: RequestWithDbUser) {
    const channels = await this.channelService.getMyChannels(req.user.id)
    return channels.map((channel) => new ChannelEntity(channel))
  }

  @Get('/channels/:id')
  @UseGuards(UserIsNotBanFromChannelGuard, UserIsPresentGuard)
  async getChannel(@Param('id', ParseUUIDPipe) id: string) {
    const channel = await this.channelService.getChannel(id, {
      withMembers: true,
      withMessages: true,
      withActions: true,
    })
    if (!channel) throw new NotFoundException('Channel not found')
    return new ChannelEntity(channel)
  }

  @Post('/channels')
  async createChannel(
    @Req() req: RequestWithDbUser,
    @Body() createChannel: CreateChannelDto,
  ) {
    const channel = await this.channelService.createChannel({
      name: createChannel.name,
      type: createChannel.type,
      userId: req.user.id,
      password: createChannel.password,
    })
    this.eventEmitter.emit(
      ChannelJoinedEvent.name,
      new ChannelJoinedEvent(channel.id, req.user.id),
    )
    return new ChannelEntity(channel)
  }

  @Patch('/channels')
  async editChannel(
    @Req() req: RequestWithDbUser,
    @Body() editedChannel: EditChannelDto,
  ) {
    const currentChannelState = await this.channelService.getChannel(
      editedChannel.id,
      {},
    )
    const userRole = currentChannelState?.members.find(
      (member) => member.userId === req.user.id,
    )?.role
    if (userRole !== Role.owner) {
      throw new ForbiddenException('You are not owner of this channel')
    }
    const channel = await this.channelService.editChannel({
      id: editedChannel.id,
      name: editedChannel.name,
      type: editedChannel.type,
      password: editedChannel.password,
    })
    this.eventEmitter.emit(
      ChannelEditEvent.name,
      new ChannelEditEvent(channel.id),
    )
    return new ChannelEntity(channel)
  }

  @Post('/pms')
  async createPms(
    @Req() req: RequestWithDbUser,
    @Body() createPm: CreatePmDto,
  ) {
    const channel = await this.channelService.createDirectMessageChannel({
      userId: req.user.id,
      targetId: createPm.targetId,
    })
    if (!channel) throw new BadRequestException('Invalid target ID')
    this.eventEmitter.emit(
      ChannelJoinedEvent.name,
      new ChannelJoinedEvent(channel.id, req.user.id),
    )
    return new ChannelEntity(channel)
  }

  @Post('/channels/:id/join')
  @UseGuards(UserIsNotBanFromChannelGuard)
  async joinChannel(
    @Req() req: RequestWithDbUser,
    @Param('id', ParseUUIDPipe) channelId: string,
    @Body('password') password?: string,
  ) {
    const channelMembers = await this.channelService.joinChannel(
      req.user.id,
      channelId,
      password,
    )
    this.eventEmitter.emit(
      ChannelJoinedEvent.name,
      new ChannelJoinedEvent(channelMembers.channelId, req.user.id),
    )
    return new ChannelEntity(channelMembers)
  }

  @Post('/channels/:id/leave')
  async leaveChannel(
    @Req() req: RequestWithDbUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const channel = await this.channelService.leaveChannel(req.user.id, id)
    this.eventEmitter.emit(
      ChannelLeftEvent.name,
      new ChannelLeftEvent(id, req.user.id),
    )
    return new ChannelEntity(channel)
  }

  @Post('/channels/:id/kick')
  @UseGuards(UserIsNotBanFromChannelGuard, UserIsAdminOrOwner)
  async kickUserFromChannel(
    @Req() req: RequestWithDbUser,
    @Param('id', ParseUUIDPipe) channelId: string,
    @Body() body: UserActionDto,
  ) {
    if (req.user.id === body.userId)
      throw new BadRequestException('You cannot kick yourself')
    await this.channelService.leaveChannel(body.userId, channelId)
    this.eventEmitter.emit(
      ChannelKickEvent.name,
      new ChannelKickEvent(channelId, body.userId),
    )
  }

  @Post('/channels/:id/ban')
  @UseGuards(UserIsNotBanFromChannelGuard, UserIsAdminOrOwner)
  async banUserFromChannel(
    @Req() req: RequestWithDbUser,
    @Param('id', ParseUUIDPipe) channelId: string,
    @Body() body: UserActionDto,
  ) {
    if (req.user.id === body.userId)
      throw new BadRequestException('You cannot ban yourself')
    await this.channelService.applyBanAction(channelId, body.userId)
    await this.channelService.leaveChannel(body.userId, channelId)
    this.eventEmitter.emit(
      ChannelBanEvent.name,
      new ChannelBanEvent(channelId, body.userId),
    )
  }

  @Post('/channels/:id/mute')
  @UseGuards(UserIsNotBanFromChannelGuard, UserIsAdminOrOwner)
  async muteUserFromChannel(
    @Req() req: RequestWithDbUser,
    @Param('id', ParseUUIDPipe) channelId: string,
    @Body() body: UserActionDto,
  ) {
    if (req.user.id === body.userId)
      throw new BadRequestException('You cannot mute yourself')
    const until = new Date()
    until.setMinutes(until.getMinutes() + 5)
    await this.channelService.applyBanAction(channelId, body.userId, until)
    this.eventEmitter.emit(
      ChannelMutedEvent.name,
      new ChannelMutedEvent(channelId, body.userId),
    )
  }

  @Post('/channels/:id/admin')
  @UseGuards(UserIsNotBanFromChannelGuard, UserIsAdminOrOwner)
  async setUserAdmin(
    @Req() req: RequestWithDbUser,
    @Param('id', ParseUUIDPipe) channelId: string,
    @Body() body: UserActionDto,
  ) {
    if (req.user.id === body.userId)
      throw new BadRequestException('You cannot admin yourself')
    await this.channelService.toggleUserAdmin(channelId, body.userId)
    this.eventEmitter.emit(
      ChannelEditEvent.name,
      new ChannelEditEvent(channelId),
    )
  }

  @Post('/channels/:id/invite')
  @UseGuards(UserIsNotBanFromChannelGuard, UserIsAdminOrOwner)
  async inviteUserToChannel(
    @Req() req: RequestWithDbUser,
    @Param('id', ParseUUIDPipe) channelId: string,
    @Body() body: InviteUserDto,
  ) {
    if (req.user.id === body.userId)
      throw new BadRequestException('You cannot invite yourself')
    await this.channelService.inviteUserToChannel(channelId, body.userId)
    this.eventEmitter.emit(
      ChannelJoinedEvent.name,
      new ChannelJoinedEvent(channelId, body.userId),
    )
  }

  @Get('/channels/:id/users')
  @UseGuards(UserIsNotBanFromChannelGuard)
  async userNotJoined(@Param('id', ParseUUIDPipe) channelId: string) {
    const users = await this.channelService.getUsersNotInChannel(channelId)
    return users.map((user) => new UserEntity(user))
  }
}

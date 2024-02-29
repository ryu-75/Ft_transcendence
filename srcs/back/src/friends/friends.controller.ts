import {
  Body,
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  BadRequestException,
  Post,
  Delete,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FriendsService } from './friends.service'
import { FriendshipRemovalDto } from './dto/friend-removal.dto'
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard'
import { FriendEntity } from './entity/friends.entity'
import { RequestWithDbUser } from '../types/Request'
import { FriendsRequestDto } from './dto/friend-request.dto'
import { FriendRequestEvent } from '../notification/events/notification.event'

@Controller('friends')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get()
  async getFriends(@Req() req: RequestWithDbUser) {
    const friends = await this.friendsService.getMyFriends(req.user.id)

    return friends.map((friend) => new FriendEntity(friend))
  }

  @Post()
  async createFriendRequest(
    @Req() req: RequestWithDbUser,
    @Body() friendsRequestDto: FriendsRequestDto,
  ) {
    if (req.user.id === friendsRequestDto.friendOfId)
      throw new BadRequestException('You cannot be friend with yourself')
    if (
      await this.friendsService.findFriend(
        req.user.id,
        friendsRequestDto.friendOfId,
      )
    )
      throw new BadRequestException(
        'Already friend or friendship not confirmed',
      )
    const createFriendRequest = await this.friendsService.create(
      req.user.id,
      friendsRequestDto.friendOfId,
    )
    this.eventEmitter.emit(
      FriendRequestEvent.name,
      new FriendRequestEvent(createFriendRequest.friendOfId),
    )
    return createFriendRequest
  }

  @Post('add')
  async addNewFriend(
    @Req() req: RequestWithDbUser,
    @Body() friendsRequestDto: FriendsRequestDto,
  ) {
    if (req.user.id === friendsRequestDto.friendOfId)
      throw new BadRequestException('You cannot be friend with yourself')
    const friend = await this.friendsService.addFriends(
      req.user.id,
      friendsRequestDto.friendOfId,
    )
    this.eventEmitter.emit(
      FriendRequestEvent.name,
      new FriendRequestEvent(friendsRequestDto.friendOfId),
    )
    return friend
  }

  @Delete('remove')
  async removeFriend(
    @Req() req: RequestWithDbUser,
    @Body() friendshipRemovalDto: FriendshipRemovalDto,
  ) {
    if (req.user.id === friendshipRemovalDto.friendOfId)
      throw new BadRequestException('You cannot delete yourself')
    const friend = await this.friendsService.deleteFriend(
      req.user.id,
      friendshipRemovalDto.friendOfId,
    )
    this.eventEmitter.emit(
      FriendRequestEvent.name,
      new FriendRequestEvent(friendshipRemovalDto.friendOfId),
    )
    return friend
  }
}

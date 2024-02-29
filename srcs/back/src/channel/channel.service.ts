import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

import { ChannelType, Prisma, Role } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { createHmac } from 'crypto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ChannelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Retrieves the channels associated with a given user.
   * @param userId - The ID of the user.
   * @param options - Additional options for retrieving channel data.
   * @param options.withMembers - Set to true to include member data in the result.
   * @param options.withMessages - Set to true to include message data in the result.
   * @param options.withActions - Set to true to include action data in the result.
   * @returns A promise that resolves to an array of channels.
   */
  async getMyChannels(userId: number) {
    return this.prismaService.channel.findMany({
      select: {
        id: true,
      },
      where: {
        members: {
          some: {
            present: true,
            userId,
          },
        },
      },
    })
  }

  /**
   * Checks if a user is a member of a channel.
   * @param userId - The ID of the user.
   * @param channelId - The ID of the channel.
   * @returns A boolean indicating whether the user is a member of the channel.
   */
  async isUserInChannel(userId: number, channelId: string) {
    const channelMember = await this.prismaService.channelMember.findFirst({
      where: {
        userId,
        channelId,
        present: true,
      },
    })
    return !!channelMember
  }

  /**
   * Joins a channel with the specified user ID and channel ID.
   * @param userId - The ID of the user joining the channel.
   * @param channelId - The ID of the channel to join.
   * @param password - (Optional) The password for the channel, if required.
   * @throws BadRequestException if the channel is not found, the user is already in the channel,
   * the channel is a direct message, the channel type does not match the password requirement,
   * or the provided password is invalid.
   */
  async joinChannel(userId: number, channelId: string, password?: string) {
    const channel = await this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
    })
    if (!channel) throw new BadRequestException('Channel not found')
    if (channel.type === ChannelType.public && password)
      throw new BadRequestException('Public channels cannot have passwords')
    if (channel.type === ChannelType.private && password)
      throw new BadRequestException('Private channels cannot have passwords')
    if (channel.type === ChannelType.protected) {
      if (!password) {
        throw new ForbiddenException('This channel requires a password')
      }
      // Hash the password and compare it to the stored password
      if (!this.verifyPassword(password, channel.password!)) {
        throw new ForbiddenException('Invalid password')
      }
    }
    // Create a new channel member or update an existing one
    return this.prismaService.channelMember.upsert({
      where: {
        userId_channelId: {
          channelId: channel.id,
          userId,
        },
      },
      create: {
        userId,
        channelId: channel.id,
        present: true,
      },
      update: {
        present: true,
      },
    })
  }

  /**
   * Removes a user from a channel.
   * @param userId - The ID of the user.
   * @param channelId - The ID of the channel.
   * @returns A promise that resolves to the number of channel members deleted.
   */
  async leaveChannel(userId: number, channelId: string) {
    const channel = await this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        members: true,
      },
    })
    if (!channel) throw new BadRequestException('Channel not found')
    const result = await this.prismaService.channelMember.update({
      where: {
        userId_channelId: {
          channelId: channelId,
          userId: userId,
        },
      },
      data: {
        present: false,
        role: Role.user,
      },
    })
    const member = channel.members.find((m) => m.userId === userId)
    if (member?.role !== Role.owner) {
      return result
    }
    const nextOwner = channel.members.find((member) => {
      return member.present === true && member.userId !== userId
    })
    if (!nextOwner) {
      return result
    }
    return this.prismaService.channelMember.update({
      where: {
        userId_channelId: {
          channelId: channelId,
          userId: nextOwner.userId,
        },
      },
      data: {
        role: Role.owner,
      },
    })
  }

  async getChannel(
    id: string,
    {
      withMessages = false,
      withMembers = false,
      withActions = false,
    }: {
      withMessages?: boolean
      withMembers?: boolean
      withActions?: boolean
    },
  ) {
    return this.prismaService.channel.findUnique({
      where: {
        id,
      },
      include: {
        actions: withActions,
        messages: withMessages,
        members: {
          include: {
            user: withMembers && {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    })
  }

  verifyPassword(password: string, hashedPassword: string) {
    const hpassword = createHmac(
      'sha256',
      this.configService.getOrThrow('SALT'),
    )
      .update(password)
      .digest('hex')
    return hpassword === hashedPassword
  }

  /**
   * Creates a new channel based on the provided parameters.
   * @param name - The name of the channel (optional for some channel types).
   * @param password - The password for the channel (optional for some channel types).
   * @param type - The type of the channel (direct, protected, public, private).
   * @param userId - The ID of the user creating the channel.
   * @returns A Promise that resolves to the created channel.
   * @throws BadRequestException if the provided parameters are invalid.
   */
  async createChannel({
    name,
    password,
    type,
    userId,
  }: {
    name: string
    password?: string
    type: ChannelType
    userId: number
  }) {
    if (type === ChannelType.protected) {
      if (!name) throw new BadRequestException('Channels must be named')
      if (!password)
        throw new BadRequestException('Protected channels must have passwords')
    } else if (type === ChannelType.public) {
      if (!name) throw new BadRequestException('Channels must be named')
      if (password)
        throw new BadRequestException('Public channels cannot have passwords')
    } else if (type === ChannelType.private) {
      if (!name) throw new BadRequestException('Channels must be named')
      if (password)
        throw new BadRequestException(
          'Private channels must not have passwords',
        )
    }
    if (password) {
      password = createHmac('sha256', this.configService.getOrThrow('SALT'))
        .update(password)
        .digest('hex')
    }
    const data: Prisma.ChannelCreateInput = {
      name,
      type,
      password: password ?? undefined,
      owner: {
        connect: {
          id: userId,
        },
      },
      members: {
        create: {
          userId,
          role: 'owner',
        },
      },
    }
    return this.prismaService.channel.create({
      data,
    })
  }

  async editChannel({
    id,
    name,
    password,
    type,
  }: {
    id: string
    name: string
    password?: string
    type: ChannelType
  }) {
    if (type === ChannelType.protected) {
      if (!name) throw new BadRequestException('Channels must be named')
      if (!password)
        throw new BadRequestException('Protected channels must have passwords')
    } else if (type === ChannelType.public) {
      if (!name) throw new BadRequestException('Channels must be named')
      if (password)
        throw new BadRequestException('Public channels cannot have passwords')
    } else if (type === ChannelType.private) {
      if (!name) throw new BadRequestException('Channels must be named')
      if (password)
        throw new BadRequestException(
          'Private channels must not have passwords',
        )
    }
    if (password) {
      password = createHmac('sha256', this.configService.getOrThrow('SALT'))
        .update(password)
        .digest('hex')
    }

    return this.prismaService.channel.update({
      where: {
        id: id,
      },
      data: {
        name,
        type,
        password: password ?? undefined,
      },
    })
  }

  async createDirectMessageChannel({
    userId,
    targetId,
  }: {
    userId: number
    targetId: number
  }) {
    if (userId === targetId)
      throw new BadRequestException('You cannot create a PM with yourself')
    const channel = await this.prismaService.channel.findFirst({
      where: {
        type: ChannelType.direct,
        members: {
          every: {
            userId: {
              in: [userId, targetId],
            },
          },
        },
      },
    })
    if (channel) {
      await this.prismaService.channelMember.update({
        where: {
          userId_channelId: {
            channelId: channel.id,
            userId: userId,
          },
        },
        data: {
          present: true,
        },
      })
      return channel
    }
    return this.prismaService.channel.create({
      include: {
        members: true,
      },
      data: {
        type: ChannelType.direct,
        members: {
          createMany: {
            data: [
              {
                userId,
              },
              {
                userId: targetId,
              },
            ],
          },
        },
      },
    })
  }

  /**
   * Retrieves the members of a channel.
   * @param channelId - The ID of the channel.
   * @returns A promise that resolves to an array of channel members, including their ID, username, and image.
   */
  async getMembers(channelId: string) {
    return this.prismaService.channelMember.findMany({
      where: {
        channelId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    })
  }

  /**
   * Retrieves all public channels where user isnt part of.
   * @returns A promise that resolves to an array of public or protected channels.
   */
  async getNotJoinedVisibleChannels(userId: number) {
    return this.prismaService.channel.findMany({
      where: {
        type: {
          in: [ChannelType.public, ChannelType.protected],
        },
        OR: [
          {
            members: {
              none: {
                userId,
              },
            },
          },
          {
            members: {
              some: {
                userId,
                present: false,
              },
            },
          },
        ],
      },
    })
  }

  async applyBanAction(channelId: string, userId: number, time?: Date) {
    await this.prismaService.channelAction.upsert({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
      create: {
        userId,
        channelId,
        deletedAt: time,
      },
      update: {
        deletedAt: time,
      },
    })
  }

  async isUserBanFromChannel(channelId: string, userId: number) {
    return this.prismaService.channelAction.findFirst({
      where: {
        userId: userId,
        channelId: channelId,
        OR: [
          {
            deletedAt: {
              gte: new Date(),
            },
          },
          {
            deletedAt: null,
          },
        ],
      },
    })
  }

  async toggleUserAdmin(channelId: string, userId: number) {
    const isOwner = await this.isUserOwnerOfChannel(channelId, userId)
    if (isOwner) throw new BadRequestException('User is owner of channel')
    const isAdmin = await this.isUserOwnerOrAdminOfChannel(channelId, userId)
    await this.prismaService.channelMember.update({
      where: {
        userId_channelId: {
          channelId,
          userId,
        },
      },
      data: {
        role: isAdmin ? Role.user : Role.admin,
      },
    })
  }

  async isUserOwnerOfChannel(channelId: string, userId: number) {
    const user = await this.prismaService.channelMember.findUnique({
      where: {
        userId_channelId: {
          channelId,
          userId,
        },
        role: 'owner',
      },
    })
    return !!user
  }

  /**
   * Checks if a user is the owner or admin of a channel.
   * @param channelId - The ID of the channel.
   * @param userId - The ID of the user.
   * @returns A boolean indicating whether the user is the owner or admin of the channel.
   */
  async isUserOwnerOrAdminOfChannel(channelId: string, userId: number) {
    const user = await this.prismaService.channelMember.findUnique({
      where: {
        userId_channelId: {
          channelId,
          userId,
        },
        role: {
          in: [Role.admin, Role.owner],
        },
      },
    })
    return !!user
  }

  /**
   * Checks if a user is present in a channel.
   * @param channelId - The ID of the channel.
   * @param userId - The ID of the user.
   * @returns A boolean indicating whether the user is present in the channel.
   */
  async isUserPresentInChannel(channelId: string, userId: number) {
    const channel = await this.prismaService.channelMember.findFirst({
      where: {
        channelId,
        userId,
        present: true,
      },
    })
    return !!channel
  }

  async getUsersNotInChannel(channelId: string) {
    return this.prismaService.user.findMany({
      where: {
        members: {
          none: {
            channelId: channelId,
            present: true,
          },
        },
      },
    })
  }

  async inviteUserToChannel(channelId: string, userId: number) {
    return this.prismaService.channelMember.upsert({
      create: {
        userId,
        channelId,
        present: true,
      },
      update: {
        present: true,
      },
      where: {
        userId_channelId: {
          channelId,
          userId,
        },
      },
    })
  }
}

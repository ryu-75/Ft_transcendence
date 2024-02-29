import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma, User } from '@prisma/client'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async find(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    })
  }

  async findUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }

  async findMany(params: {
    skip?: number
    take?: number
    cursor?: Prisma.UserWhereUniqueInput
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    })
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<boolean> {
    const user = await this.prisma.user.delete({
      where,
    })
    return !!user
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput
    data: Prisma.UserUpdateInput
  }): Promise<User> {
    const { where, data } = params
    return this.prisma.user.update({
      where,
      data,
    })
  }

  async findOrCreate(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    data: Prisma.UserCreateInput,
  ): Promise<User> {
    const user = await this.find(userWhereUniqueInput)
    if (user) return user
    return this.create(data)
  }

  async is2faEnabled(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    const user = await this.find(userWhereUniqueInput)
    if (!user) return false
    return user.twoFaEnabled
  }

  async enable2fa(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    return this.update({
      where: userWhereUniqueInput,
      data: { twoFaEnabled: true },
    })
  }

  async blockUser(userId: number, blockedId: number) {
    const exists = await this.prisma.blockList.findUnique({
      where: {
        userId_blockedId: {
          userId,
          blockedId,
        },
      },
    })
    if (exists)
      return this.prisma.blockList.delete({
        where: {
          userId_blockedId: {
            userId: exists.userId,
            blockedId: exists.blockedId,
          },
        },
      })
    return this.prisma.blockList.create({
      data: {
        userId,
        blockedId,
      },
    })
  }

  async getBlockList(userId: number) {
    return this.prisma.blockList.findMany({
      select: {
        blockedId: true,
      },
      where: {
        userId,
      },
    })
  }

  async isBlocked(userId: number, blockedId: number) {
    const exists = await this.prisma.blockList.findUnique({
      where: {
        userId_blockedId: {
          userId,
          blockedId,
        },
      },
    })
    return !!exists
  }

  async updateElo(winner_id: number, loser_id: number) {

    await this.prisma.user.update({
        where: {
            id: winner_id
        },
        data: {
            elo: {
                increment: 50,
            }
        }
    })
    await this.prisma.user.update({
        where: {
            id: loser_id
        },
        data: {
            elo: {
                decrement: 20,
            }
        }
    })
  }
}
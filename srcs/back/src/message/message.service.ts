import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Saves a message in a channel.
   *
   * @param senderId - The ID of the sender.
   * @param channelId - The ID of the channel.
   * @param content - The content of the message.
   */
  async saveChannelMessage(
    senderId: number,
    channelId: string,
    content: string,
    gameInvite: boolean,
  ) {
    return this.prisma.channelMessage.create({
      data: {
        content,
        gameInvite,
        channel: {
          connect: {
            id: channelId,
          },
        },
        sender: {
          connect: {
            id: senderId,
          },
        },
      },
    })
  }

  /**
   * Retrieves the messages for a given channel.
   * @param channelId - The ID of the channel.
   * @returns A promise that resolves to an array of channel messages.
   */
  async getChannelMessages(channelId: string) {
    return this.prisma.channelMessage.findMany({
      where: {
        channelId,
      },
    })
  }

  async deleteMessage(messageId: number): Promise<boolean> {
    try {
      const deleteMessage = await this.prisma.channelMessage.delete({
        where: {
            id: messageId,
        },
      });
      return true
    } catch (error) {
      throw new BadRequestException();
    }
  }
}

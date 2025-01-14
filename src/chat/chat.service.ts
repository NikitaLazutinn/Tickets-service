import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createChatRoom(eventId: number, userId: number, creatorId: number) {
    const existingRoom = await this.prisma.chatRoom.findFirst({
      where: { eventId, userId, creatorId },
    });

    if (existingRoom) return existingRoom;

    return this.prisma.chatRoom.create({
      data: { eventId, userId, creatorId },
    });
  }

  async addMessage(chatRoomId: number, senderId: number, content: string) {
    return this.prisma.message.create({
      data: { chatRoomId, senderId, content },
    });
  }

  async getChatHistory(chatRoomId: number, token: string) {
    const userId = token['userId'];
    const isParticipant = await this.prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId,
        OR: [{ userId }, { creatorId: userId }],
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException(
        'Access denied: You are not a participant of this chat.',
      );
    }
    return this.prisma.message.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' },
    });
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(
    eventId: number,
    userId: number,
    message: string,
    type: string,
  ) {
    await this.prisma.notification.create({
      data: {
        eventId,
        userId,
        message,
        type,
      },
    });

    return { message: 'Notification created successfully!' };
  }

  async getNotifications(token: string) {
    const userId = token['userId'];

    if (token['roleId'] === 3) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

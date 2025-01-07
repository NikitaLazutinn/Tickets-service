import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SavedEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveEvent(token: string, eventId: number) {
    const existing = await this.prisma.savedEvent.findUnique({
      where: { userId_eventId: { userId: token['userId'], eventId } },
    });

    if (existing) {
      throw new ConflictException('This event is already saved');
    }

    const savedEvent = await this.prisma.savedEvent.create({
      data: { userId: token['userId'], eventId },
    });

    return { message: 'Event saved successfully', savedEvent };
  }

  async getSavedEvents(
    token: string,
    filters: {
      userId?: number;
      eventId?: number;
      sort?: 'asc' | 'desc';
      title?: string;
    },
  ) {
    const { userId, eventId, sort, title } = filters;
    const currentUserId = token['userId'];
    const savedEvents = await this.prisma.savedEvent.findMany({
      where: {
        userId: userId || currentUserId,
        eventId: eventId ? eventId : undefined,
        event: {
          title: title ? { contains: title, mode: 'insensitive' } : undefined,
        },
      },
      include: { event: true },
      orderBy: sort ? { savedAt: sort } : undefined,
    });

    if (!savedEvents.length) {
      throw new NotFoundException('No saved events found');
    }

    return savedEvents.map((se) => ({
      eventId: se.eventId,
      eventTitle: se.event.title,
      savedAt: se.savedAt,
    }));
  }

  async removeSavedEvent(token: string, eventId: number) {
    const existing = await this.prisma.savedEvent.findUnique({
      where: { userId_eventId: { userId: token['userId'], eventId } },
    });

    if (!existing) {
      throw new NotFoundException('Saved event not found');
    }

    await this.prisma.savedEvent.delete({
      where: { userId_eventId: { userId: token['userId'], eventId } },
    });

    return { message: 'Event removed from saved list' };
  }
}

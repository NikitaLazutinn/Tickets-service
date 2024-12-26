import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { PrismaService } from 'prisma/prisma.service';
import { EventsService } from 'src/events_/events.service';
import { title } from 'process';

@Injectable()
export class RatingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}
  async createRating(dto: CreateRatingDto) {
    const { eventId, rating, userId } = dto;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const existingRating = await this.prisma.rating.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existingRating) {
      throw new ConflictException('Rating already exists');
    }

    await this.prisma.rating.create({
      data: { userId, eventId, rating },
    });

    await this.updateEventAverageRating(eventId);

    return {
      message: `Rating created successfully for EventId ${eventId} and UserId ${userId}`,
    };
  }

  async updateRating(dto: UpdateRatingDto, token: string) {
    const { eventId, rating, userId } = dto;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const existingRating = await this.prisma.rating.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (!existingRating) {
      throw new NotFoundException('Rating not found');
    }

    const isOwner = userId === token['id'];
    const isAdmin = token['roleId'] === 1;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Only the owner or an administrator can update this rating',
      );
    }

    await this.prisma.rating.update({
      where: { userId_eventId: { userId, eventId } },
      data: { rating },
    });

    await this.updateEventAverageRating(eventId);

    return {
      message: `Rating updated successfully for EventId ${eventId} and UserId ${userId}`,
    };
  }

  private async updateEventAverageRating(eventId: number) {
    const ratings = await this.prisma.rating.findMany({
      where: { eventId },
      select: { rating: true },
    });

    const averageRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await this.prisma.event.update({
      where: { id: eventId },
      data: { averageRating },
    });
  }

  async getRatingForEvent(eventId: number) {
    const event = await this.eventsService.findOneEventWithRatings(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      eventId: event.id,
      title: event.title,
      averageRating: event.averageRating,
      ratings: event.ratings,
    };
  }

  async getAllRatings(eventId: number) {
    if (eventId) {
      return this.getRatingForEvent(eventId);
    }

    const events = await this.eventsService.findEventsWithRatings();

    return events.map((event) => ({
      eventId: event.id,
      title: event.title,
      averageRating: event.averageRating,
      totalRatings: event.ratings.length,
    }));
  }

  async remove(id: number, token: any) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    const isOwner = rating.userId === token.id;
    const isAdmin = token.roleId === 1;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Only the owner or an administrator can delete this rating',
      );
    }

    await this.prisma.rating.delete({
      where: { id },
    });

    return { message: 'Rating deleted successfully' };
  }
}

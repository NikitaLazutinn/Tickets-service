import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, token: string) {
    const { eventId, userId, seatNumber, price } = createTicketDto;

    const eventExists = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!eventExists) {
      throw new NotFoundException(`Event with ID ${eventId} does not exist.`);
    }

    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} does not exist.`);
    }

    return this.prisma.ticket.create({
      data: { eventId, userId, seatNumber, price },
    });
  }

  async findAll(
    query: { page?: number; sort?: string; eventId?: string; userId?: string },
    token: string,
  ) {
    const { page = 1, sort = 'createdAt', eventId, userId } = query;

    let whereClause: any = {};

    if (token['roleId'] === 3) {
      if (userId && parseInt(userId) !== token['id']) {
        throw new ForbiddenException('Access denied to other user tickets');
      }
      whereClause.userId = token['id'];
    } else if (token['roleId'] === 2) {
      const eventsCreatedByUser = await this.prisma.event.findMany({
        where: { creatorId: token['id'] },
        select: { id: true },
      });

      if (!eventsCreatedByUser.length) {
        throw new NotFoundException('No events found for this organizer');
      }

      const eventIds = eventsCreatedByUser.map((event) => event.id);

      if (eventId && !eventIds.includes(parseInt(eventId))) {
        throw new ForbiddenException(
          `Access denied to tickets for event ID ${eventId}`,
        );
      }

      whereClause.eventId = eventId ? parseInt(eventId) : { in: eventIds };
    } else if (token['roleId'] === 1) {
      if (eventId) whereClause.eventId = parseInt(eventId);
      if (userId) whereClause.userId = parseInt(userId);
    } else {
      throw new ForbiddenException('Access denied');
    }

    const tickets = await this.prisma.ticket.findMany({
      where: whereClause,
      orderBy: { [sort]: 'asc' },
      skip: (page - 1) * 10,
      take: 10,
    });

    if (!tickets.length) {
      throw new NotFoundException('No tickets found');
    }

    return tickets;
  }

  async findOne(id: number, token: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (token['roleId'] === 3 && ticket.userId !== token['id']) {
      throw new ForbiddenException('Access denied to this ticket');
    }
    if (
      token['roleId'] === 2 &&
      !(await this.isEventCreator(token['id'], ticket.eventId))
    ) {
      throw new ForbiddenException('Access denied to this ticket');
    }

    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto, token: string) {
    await this.findOne(id, token);

    await this.prisma.ticket.update({
      where: { id: id },
      data: updateTicketDto,
    });

    return { message: 'Ticket updated successfully' };
  }

  async remove(id: number, token: string) {
    await this.findOne(id, token);

    await this.prisma.ticket.delete({ where: { id: id } });

    return { message: 'Ticket deleted successfully' };
  }

  private async isEventCreator(
    userId: number,
    eventId: number,
  ): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    return event?.creatorId === userId;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto) {
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

  async findAll(query: {
    page?: number;
    sort?: string;
    eventId?: string;
    userId?: string;
  }) {
    const { page = 1, sort = 'createdAt', eventId, userId } = query;

    return this.prisma.ticket.findMany({
      where: {
        eventId: eventId ? parseInt(eventId) : undefined,
        userId: userId ? parseInt(userId) : undefined,
      },
      orderBy: { [sort]: 'asc' },
      skip: (page - 1) * 10,
      take: 10,
    });
  }

  async findOne(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    await this.findOne(id);

    await this.prisma.ticket.update({
      where: { id: id },
      data: updateTicketDto,
    });

    return { message: 'Ticket updated successfully' };
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.ticket.delete({ where: { id: id } });

    return { message: 'Ticket deleted successfully' };
  }
}

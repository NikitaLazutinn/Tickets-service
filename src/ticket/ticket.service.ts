import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from 'prisma/prisma.service';
import { EventsService } from 'src/events_/events.service';
import { UsersService } from 'src/users/users.service';
import { Dropbox } from 'dropbox';
import * as fs from 'fs';
import { DropboxService } from './dropbox/dropbox.service';
import { PdfService } from 'src/pdf/pdf.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
    private readonly userService: UsersService,
    private readonly dropboxService: DropboxService,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
  ) {}

  async create(createTicketDto: CreateTicketDto, token: string) {
    const { eventId, userId, seatNumber, price } = createTicketDto;

    const eventExists = await this.eventsService.findOne(eventId);
    const userExists = await this.userService.find(userId);

    if (!eventExists) {
      throw new NotFoundException(`Event with ID ${eventId} does not exist.`);
    }

    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} does not exist.`);
    }

    const ticket = await this.prisma.ticket.create({
      data: { eventId, userId, seatNumber, price },
    });

    const eventCreator = await this.userService.find(eventExists.creatorId);
    if (eventCreator.notifyOnNewVisitors) {
      await this.emailService.sendEmail(
        eventCreator.email,
        'New Visitor Notification',
        `A new visitor has purchased a ticket for your event "${eventExists.title}".`,
        [],
      );
    }

    return ticket;
  }

  async findAll(
    query: { page?: number; sort?: string; eventId?: string; userId?: string },
    token: string,
  ) {
    const { page = 1, sort = 'createdAt', eventId, userId } = query;

    const whereClause: any = {};

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
      !(await this.eventsService.isEventCreator(token['id'], ticket.eventId))
    ) {
      throw new ForbiddenException('Access denied to this ticket');
    }

    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto, token: string) {
    await this.findOne(id, token);

    await this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto,
    });

    return { message: 'Ticket updated successfully' };
  }

  async remove(id: number, token: string) {
    await this.findOne(id, token);

    await this.prisma.ticket.delete({ where: { id } });

    return { message: 'Ticket deleted successfully' };
  }

  async generateTicketPdfAndUploadToDropbox(token: string, ticketId: number) {
    const user = await this.userService.find(token['userId']);
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!user || !ticket) {
      throw new NotFoundException('User or ticket not found');
    }

    const pdfPath = await this.pdfService.generateTicketPdf({
      id: ticket.id,
      eventTitle: ticket.event.title,
      date: new Date(ticket.event.date).toLocaleDateString(),
      location: ticket.event.location,
      seat: ticket.seatNumber,
      price: ticket.price,
      posterUrl: ticket.event.posterUrl,
    });

    try {
      await this.emailService.sendEmail(
        user.email,
        'Your Ticket PDF',
        'Thank you for your payment.',
        [{ filename: 'ticket.pdf', path: pdfPath }],
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to send ticket PDF email');
    }

    const dropboxLink = await this.dropboxService.uploadFile(pdfPath);

    fs.unlinkSync(pdfPath);

    return dropboxLink;
  }

  async validateTicket(ticketId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.isValidate) {
      throw new ForbiddenException('Ticket has already been validate');
    }

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { isValidate: true },
    });

    return { message: 'Ticket validate successfully' };
  }
}

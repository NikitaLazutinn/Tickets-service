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
import * as QRCode from 'qrcode';
import * as PDFDocument from 'pdfkit';
import { Dropbox } from 'dropbox';
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
    private readonly userService: UsersService,
  ) {}

  private readonly dropbox = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  });

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

    return this.prisma.ticket.create({
      data: { eventId, userId, seatNumber, price },
    });
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
    const pdfPath = await this.generateTicketPdf(ticketId);
    const user = await this.userService.find(token['userId']);
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!user || !ticket) {
      throw new BadRequestException('User or ticket not found');
    }

    try {
      await this.sendTicketEmail(user.email, pdfPath);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send ticket PDF email');
    }

    const dropboxLink = await this.uploadToDropbox(pdfPath);

    fs.unlinkSync(pdfPath);

    return dropboxLink;
  }

  private async generateTicketPdf(ticketId: number): Promise<string> {
    const doc = new PDFDocument();
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
    }

    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, `ticket_${Date.now()}.pdf`);

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      fs.writeFileSync(filePath, pdfBuffer);
    });

    doc.fontSize(12).text(`Ticket for Event ID: ${ticket.eventId}`);
    doc.text(`Seat: ${ticket.seatNumber}`);
    doc.text(`Price: ${ticket.price}`);
    doc.text(`Ticket ID: ${ticket.id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    const baseUrl = process.env.LOCALHOST_URL;
    const qrCodeData = `${baseUrl}/tickets/${ticket.id}/sale`;
    const qrCode = await QRCode.toDataURL(qrCodeData);
    doc.image(qrCode, { width: 100, height: 100 });

    doc.end();

    return filePath;
  }

  private async uploadToDropbox(filePath: string): Promise<string> {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    try {
      const response = await this.dropbox.filesUpload({
        path: `/${fileName}`,
        contents: fileContent,
      });

      const sharedLinkResponse =
        await this.dropbox.sharingCreateSharedLinkWithSettings({
          path: response.result.path_display,
        });

      return sharedLinkResponse.result.url.replace('?dl=0', '?dl=1');
    } catch (error) {
      console.error('Dropbox upload error:', error);
      throw new Error('Failed to upload to Dropbox');
    }
  }

  async saleTicket(ticketId: number, token: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.isSold) {
      throw new ForbiddenException('Ticket has already been sold');
    }

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { isSold: true },
    });

    try {
      await this.prisma.ticket.delete({ where: { id: ticketId } });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete the sold ticket',
      );
    }

    return { message: 'Ticket sold and deleted successfully' };
  }

  private async sendTicketEmail(email: string, pdfPath: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SENDER,
      to: email,
      subject: 'Your Ticket PDF',
      text: 'Thank you for your payment. Please find your ticket attached.',
      attachments: [
        {
          filename: 'ticket.pdf',
          path: pdfPath,
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send ticket email');
    }
  }
}

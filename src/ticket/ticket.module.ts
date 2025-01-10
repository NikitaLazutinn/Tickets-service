import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { EventsModule } from 'src/events_/events.module';
import { UsersModule } from 'src/users/users.module';
import { DropboxService } from './dropbox/dropbox.service';
import { EmailModule } from 'src/email/email.module';
import { PdfModule } from 'src/pdf/pdf.module';

@Module({
  controllers: [TicketController],
  providers: [TicketService, DropboxService],
  imports: [PrismaModule, EventsModule, UsersModule, EmailModule, PdfModule],
  exports: [TicketService],
})
export class TicketModule {}

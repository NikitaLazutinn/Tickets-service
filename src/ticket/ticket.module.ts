import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { EventsModule } from 'src/events_/events.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  imports: [PrismaModule, EventsModule, UsersModule],
})
export class TicketModule {}

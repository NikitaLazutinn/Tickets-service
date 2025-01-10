import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { TicketModule } from 'src/ticket/ticket.module';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [StripeModule, PrismaModule, TicketModule],
})
export class StripeModule {}

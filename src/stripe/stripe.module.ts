import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [StripeModule, PrismaModule],
})
export class StripeModule {}

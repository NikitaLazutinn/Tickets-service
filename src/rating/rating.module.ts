import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { EventsModule } from 'src/events_/events.module';

@Module({
  controllers: [RatingController],
  providers: [RatingService],
  imports: [PrismaModule, EventsModule],
})
export class RatingModule {}

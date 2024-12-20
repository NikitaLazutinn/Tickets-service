import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventController } from './events.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { ImgurModule } from 'src/imgur/imgur.module';

@Module({
  imports: [PrismaModule, ImgurModule],
  controllers: [EventController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

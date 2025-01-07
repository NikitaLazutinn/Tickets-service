import { Module } from '@nestjs/common';
import { SavedEventsService } from './saved-events.service';
import { SavedEventsController } from './saved-events.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [SavedEventsController],
  providers: [SavedEventsService],
  imports: [PrismaModule],
})
export class SavedEventsModule {}

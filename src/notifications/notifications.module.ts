import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationController } from './notifications.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [NotificationController],
  providers: [NotificationsService],
  imports: [PrismaModule],
  exports: [NotificationsService],
})
export class NotificationsModule {}

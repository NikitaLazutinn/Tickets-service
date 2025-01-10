import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthUserGuard } from 'src/guards';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(AuthUserGuard)
  @Get()
  getNotifications(@Req() req) {
    const token = req.user;
    return this.notificationsService.getNotifications(token);
  }
}

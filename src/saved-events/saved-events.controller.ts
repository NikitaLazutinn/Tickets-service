import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SavedEventsService } from './saved-events.service';
import { AuthUserGuard } from 'src/guards';

@Controller('saved-events')
export class SavedEventsController {
  constructor(private readonly savedEventsService: SavedEventsService) {}

  @UseGuards(AuthUserGuard)
  @Post(':eventId')
  async saveEvent(@Param('eventId') eventId: number, @Req() req) {
    const token = req.user;
    return this.savedEventsService.saveEvent(token, eventId);
  }

  @UseGuards(AuthUserGuard)
  @Get()
  async getSavedEvents(
    @Req() req,
    @Query('userId') userId?: number,
    @Query('eventId') eventId?: number,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('title') title?: string,
  ) {
    const token = req.user;
    return this.savedEventsService.getSavedEvents(token, {
      userId,
      eventId,
      sort,
      title,
    });
  }

  @UseGuards(AuthUserGuard)
  @Delete(':eventId')
  async removeSavedEvent(@Param('eventId') eventId: number, @Req() req) {
    const token = req.user;
    return this.savedEventsService.removeSavedEvent(token, eventId);
  }
}

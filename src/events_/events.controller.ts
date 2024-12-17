import { AuthUserGuard } from 'src/guards';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('events')
export class EventController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AuthUserGuard)
  @UseInterceptors(FileInterceptor('Poster'))
  @Post()
  create(
    @Req() request,
    @Body() createEventDto: CreateEventDto,
    @UploadedFile()
    file,
  ) {
    const tokenData = request.user;
    return this.eventsService.create(tokenData, createEventDto, file);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}

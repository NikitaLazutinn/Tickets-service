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
  @Post()
  createEvent(@Req() request, @Body() createEventDto: CreateEventDto) {
    const tokenData = request.user;
    return this.eventsService.create(tokenData, createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @UseGuards(AuthUserGuard)
  @Patch(':id')
  update(
    @Req() request,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const tokenData = request.user;
    return this.eventsService.update(+id, updateEventDto, tokenData);
  }

  @UseGuards(AuthUserGuard)
  @UseInterceptors(FileInterceptor('Poster'))
  @Patch('poster/:id')
  replaceImage(
    @Req() request,
    @Param('id') id: string,
    @UploadedFile()
    file,
  ) {
    const tokenData = request.user;
    return this.eventsService.updateImage(+id, file, tokenData);
  }

  @UseGuards(AuthUserGuard)
  @Delete('poster/:id')
  deleteImage(@Req() request, @Param('id') id: string) {
    const tokenData = request.user;
    return this.eventsService.deleteImage(+id, tokenData);
  }

  @UseGuards(AuthUserGuard)
  @Delete(':id')
  remove(@Req() request, @Param('id') id: string) {
    const tokenData = request.user;
    return this.eventsService.remove(+id, tokenData);
  }
}

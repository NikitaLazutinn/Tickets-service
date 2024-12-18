import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AuthUserGuard } from 'src/guards';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @UseGuards(AuthUserGuard)
  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @Req() req) {
    const token = req.user;
    return this.ticketService.create(createTicketDto, token);
  }

  @UseGuards(AuthUserGuard)
  @Get()
  findAll(
    @Query()
    query: {
      page?: number;
      sort?: string;
      eventId?: string;
      userId?: string;
    },
    @Req() req,
  ) {
    const token = req.user;
    return this.ticketService.findAll(query, token);
  }

  @UseGuards(AuthUserGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const token = req.user;
    return this.ticketService.findOne(+id, token);
  }

  // @UseGuards(AuthUserGuard)
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
  //   return this.ticketService.update(+id, updateTicketDto);
  // }

  @UseGuards(AuthUserGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const token = req.user;
    return this.ticketService.remove(+id, token);
  }
}

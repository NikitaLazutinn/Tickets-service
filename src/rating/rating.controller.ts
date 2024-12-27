import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
  Req,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { AuthUserGuard } from 'src/guards';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(AuthUserGuard)
  @Post()
  async createRating(@Body() dto: CreateRatingDto) {
    return this.ratingService.createRating(dto);
  }

  @UseGuards(AuthUserGuard)
  @Patch()
  async updateRating(@Body() dto: UpdateRatingDto, @Req() req) {
    const token = req.user;
    return this.ratingService.updateRating(dto, token);
  }

  @UseGuards(AuthUserGuard)
  @Get()
  async getAllRatings(@Query('eventId') eventId?: string) {
    return this.ratingService.getAllRatings(eventId ? +eventId : undefined);
  }

  @UseGuards(AuthUserGuard)
  @Get(':eventId')
  async getRatingForEvent(@Param('eventId') eventId: string) {
    return this.ratingService.getRatingForEvent(+eventId);
  }

  @UseGuards(AuthUserGuard)
  @Delete(':userId/:eventId')
  remove(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
    @Req() req,
  ) {
    const token = req.user;
    return this.ratingService.remove(+userId, +eventId, token);
  }
}

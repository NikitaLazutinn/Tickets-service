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
} from '@nestjs/common';
import { PromoCodeService } from './promo-code.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { AuthUserGuard } from 'src/guards';

@Controller('promo-code')
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  @UseGuards(AuthUserGuard)
  @Post()
  async create(@Body() createPromoCodeDto: CreatePromoCodeDto, @Req() req) {
    const token = req.user;
    return this.promoCodeService.create(createPromoCodeDto, token);
  }

  @UseGuards(AuthUserGuard)
  @Get()
  async findAll(@Req() req) {
    const token = req.user;
    return this.promoCodeService.findAll(token);
  }

  @UseGuards(AuthUserGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const token = req.user;
    return this.promoCodeService.findOne(+id, token);
  }

  @UseGuards(AuthUserGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePromoCodeDto: UpdatePromoCodeDto,
    @Req() req,
  ) {
    const token = req.user;
    return this.promoCodeService.update(+id, updatePromoCodeDto, token);
  }

  @UseGuards(AuthUserGuard)
  @Get(':userId/promoCodes')
  async getPromoCodeByUsers(@Param('userId') userId: string, @Req() req) {
    const token = req.user;
    return this.promoCodeService.getPromoCodeByUsers(+userId, token);
  }

  @UseGuards(AuthUserGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const token = req.user;
    return this.promoCodeService.remove(+id, token);
  }
}

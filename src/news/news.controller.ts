import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { AuthUserGuard } from 'src/guards';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @UseGuards(AuthUserGuard)
  @Post()
  create(@Body() createNewsDto: CreateNewsDto, @Req() req) {
    const token = req.user;
    return this.newsService.create(createNewsDto, token);
  }

  @UseGuards(AuthUserGuard)
  @Get()
  findAll(
    @Query()
    query: {
      page?: number;
      sort?: string;
      companyId?: string;
    },
    @Req() req,
  ) {
    const token = req.user;
    return this.newsService.findAll(query, token);
  }

  @UseGuards(AuthUserGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const token = req.user;
    return this.newsService.findOne(+id, token);
  }

  @UseGuards(AuthUserGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @Req() req,
  ) {
    const token = req.user;
    return this.newsService.update(+id, updateNewsDto, token);
  }

  @UseGuards(AuthUserGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const token = req.user;
    return this.newsService.remove(+id, token);
  }
}

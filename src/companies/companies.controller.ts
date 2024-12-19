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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/create-company.dto';
import { AuthUserGuard } from 'src/guards';

@Controller('company')
export class CompaniesController {
  constructor(private readonly companyService: CompaniesService) {}

  @UseGuards(AuthUserGuard)
  @Post()
  create(@Req() req, @Body() createCompanyDto: CreateCompanyDto) {
    const token = req.user;
    return this.companyService.create(createCompanyDto, token);
  }

  @UseGuards(AuthUserGuard)
  @Get()
  findAll(@Req() req) {
    const token = req.user;
    return this.companyService.findAll(token);
  }

  @UseGuards(AuthUserGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const token = req.user;
    return this.companyService.findOne(+id, token);
  }

  @UseGuards(AuthUserGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req,
  ) {
    const token = req.user;
    return this.companyService.update(+id, updateCompanyDto, token);
  }

  @UseGuards(AuthUserGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const token = req.user;
    return this.companyService.delete(+id, token);
  }

  @Get('email-confirmation-token/:token')
  verifyCompanyEmail(@Param('token') token: string) {
    return this.companyService.verifyCompanyEmail(token);
  }
}

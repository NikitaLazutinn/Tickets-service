import { CompaniesService } from './companies.service';
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
import { CreateCompanyDto, UpdateCompanyDto } from './dto/create-company.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @UseGuards(AuthUserGuard)
  @Post()
  createCompany(@Req() request, @Body() createCompanyDto: CreateCompanyDto) {
    const tokenData = request.user;
    return this.companiesService.create(tokenData, createCompanyDto);
  }

  
}

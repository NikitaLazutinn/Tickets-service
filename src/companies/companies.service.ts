import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ImgurService } from 'src/imgur/imgur.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {

    constructor(
    private readonly prisma: PrismaService,
    private readonly imgurService: ImgurService,
  ) {}

  async create(token_data, createCompanyDto: CreateCompanyDto) {

    if (token_data['roleId'] === 3) {
      throw new NotFoundException();
    }
    
}
}

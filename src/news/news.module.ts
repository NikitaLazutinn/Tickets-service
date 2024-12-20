import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { CompaniesModule } from 'src/companies/companies.module';

@Module({
  controllers: [NewsController],
  providers: [NewsService],
  imports: [PrismaModule, CompaniesModule],
})
export class NewsModule {}

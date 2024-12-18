import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNewsDto: CreateNewsDto) {
    const { title, content, companyId } = createNewsDto;

    const companyExists = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!companyExists) {
      throw new NotFoundException(
        `Company with ID ${companyId} does not exist.`,
      );
    }

    return this.prisma.news.create({ data: { title, content, companyId } });
  }

  async findAll(query: { page?: number; sort?: string; companyId?: string }) {
    const { page = 1, sort = 'createdAt', companyId } = query;

    return this.prisma.news.findMany({
      where: {
        companyId: companyId ? parseInt(companyId) : undefined,
      },
      orderBy: { [sort]: 'asc' },
      skip: (page - 1) * 10,
      take: 10,
    });
  }

  async findOne(id: number) {
    const news = await this.prisma.news.findUnique({ where: { id } });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    return news;
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    const news = await this.prisma.news.findUnique({ where: { id } });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    return this.prisma.news.update({ where: { id }, data: updateNewsDto });
  }

  async remove(id: number) {
    const news = await this.prisma.news.findUnique({ where: { id } });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    await this.prisma.news.delete({ where: { id } });

    return { message: 'News deleted successfully' };
  }
}

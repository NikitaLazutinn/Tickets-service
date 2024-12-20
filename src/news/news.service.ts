import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { PrismaService } from 'prisma/prisma.service';
import { CompaniesService } from 'src/companies/companies.service';

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companiesService: CompaniesService,
  ) {}

  async create(createNewsDto: CreateNewsDto, token: string) {
    const { title, content, companyId } = createNewsDto;

    const companyExists = await this.companiesService.findOne(companyId, token);

    if (!companyExists) {
      throw new NotFoundException(
        `Company with ID ${companyId} does not exist.`,
      );
    }

    if (token['roleId'] === 1) {
      return this.prisma.news.create({ data: { title, content, companyId } });
    } else if (token['roleId'] === 2 || token['roleId'] === 3) {
      if (!token['companyId']) {
        throw new ForbiddenException('You are not assigned to any company');
      }

      if (token['companyId'] !== companyId) {
        throw new ForbiddenException(
          'Access denied to create news for this company',
        );
      }

      return this.prisma.news.create({ data: { title, content, companyId } });
    } else {
      throw new ForbiddenException('Access denied');
    }
  }

  async findAll(
    query: { page?: number; sort?: string; companyId?: string },
    token: string,
  ) {
    const { page = 1, sort = 'createdAt', companyId } = query;

    let whereClause: any = {};

    if (token['roleId'] === 1) {
      whereClause.companyId = companyId ? parseInt(companyId) : undefined;
    } else if (token['roleId'] === 2 || token['roleId'] === 3) {
      if (!token['companyId']) {
        throw new ForbiddenException('You are not assigned to any company');
      }

      if (companyId && parseInt(companyId) !== token['companyId']) {
        throw new ForbiddenException('Access denied to this company news');
      }

      whereClause.companyId = token['companyId'];
    } else {
      throw new ForbiddenException('Access denied');
    }

    const news = await this.prisma.news.findMany({
      where: whereClause,
      orderBy: { [sort]: 'asc' },
      skip: (page - 1) * 10,
      take: 10,
    });

    if (!news.length) {
      throw new NotFoundException('No news found');
    }

    return news;
  }

  async findOne(id: number, token: string) {
    const news = await this.prisma.news.findUnique({ where: { id } });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    if (token['roleId'] === 1) {
      return news;
    } else if (token['roleId'] === 2 || token['roleId'] === 3) {
      if (!token['roleId']) {
        throw new ForbiddenException('You are not assigned to any company');
      }

      if (news.companyId !== token['roleId']) {
        throw new ForbiddenException('Access denied to this news');
      }

      return news;
    } else {
      throw new ForbiddenException('Access denied');
    }
  }

  async update(id: number, updateNewsDto: UpdateNewsDto, token: string) {
    await this.findOne(id, token);

    return this.prisma.news.update({ where: { id }, data: updateNewsDto });
  }

  async remove(id: number, token: string) {
    await this.findOne(id, token);
    await this.prisma.news.delete({ where: { id } });

    return { message: 'News deleted successfully' };
  }
}

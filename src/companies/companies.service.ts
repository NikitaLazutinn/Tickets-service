import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto, token: string) {
    if (token['roleId'] === 3) {
      throw new ForbiddenException('Access denied to this company');
    }
    return this.prisma.company.create({
      data: {
        ...createCompanyDto,
        createdBy: token['userId'],
      },
    });
  }

  async findAll(token: string) {
    if (token['roleId'] === 1) {
      return this.prisma.company.findMany();
    }
    return this.prisma.company.findMany({
      where: { users: { some: { id: token['userId'] } } },
    });
  }

  async findOne(id: number, token: string) {
    const company = this.prisma.company.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    if (
      company['roleId'] !== 1 &&
      !company.users((user) => user.id === token['userId'])
    ) {
      throw new ForbiddenException('Access denied.');
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto, token: string) {
    await this.findOne(id, token);

    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Only Admins can update companies.');
    }

    return this.prisma.company.update({
      where: { id },
      data: { ...updateCompanyDto },
    });
  }

  async delete(id: number, token: string) {
    await this.findOne(id, token);

    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Only Admins can delete companies.');
    }

    return this.prisma.company.delete({ where: { id } });
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PromoCodeService {
  constructor(private prisma: PrismaService) {}

  async create(createPromoCodeDto: CreatePromoCodeDto, token: string) {
    if (token['roleId'] !== 1 && token['roleId'] !== 2) {
      throw new ForbiddenException(
        'Access denied, user not Admin or not EventCreator',
      );
    }
    return this.prisma.promoCode.create({ data: createPromoCodeDto });
  }

  async findAll(token: string) {
    if (token['roleId'] !== 1 && token['roleId'] !== 2) {
      throw new ForbiddenException(
        'Access denied, user not Admin or not EventCreator',
      );
    }
    return this.prisma.promoCode.findMany();
  }

  async findOne(id: number, token: string) {
    if (token['roleId'] !== 1 && token['roleId'] !== 2) {
      throw new ForbiddenException(
        'Access denied, user not Admin or not EventCreator',
      );
    }
    const promoCode = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException(`PromoCode with ID ${id} not found`);
    }
    return promoCode;
  }

  async update(
    id: number,
    updatePromoCodeDto: UpdatePromoCodeDto,
    token: string,
  ) {
    if (token['roleId'] !== 1 && token['roleId'] !== 2) {
      throw new ForbiddenException(
        'Access denied, user not Admin or not EventCreator',
      );
    }
    await this.findOne(id, token);
    await this.prisma.promoCode.update({
      where: { id },
      data: updatePromoCodeDto,
    });
    return { message: 'Update PromoCode successfully' };
  }

  async getPromoCodeByUsers(userId: number, token: string) {
    if (token['roleId'] !== 1 && token['roleId'] !== 2) {
      throw new ForbiddenException(
        'Access denied, user not Admin or not EventCreator',
      );
    }
    return this.prisma.promoCode.findMany({
      where: {
        Users: {
          some: { userId },
        },
      },
      include: {
        Users: true,
      },
    });
  }

  async remove(id: number, token: string) {
    if (token['roleId'] !== 1 && token['roleId'] !== 2) {
      throw new ForbiddenException(
        'Access denied, user not Admin or not EventCreator',
      );
    }
    await this.findOne(id, token);
    await this.prisma.promoCode.delete({ where: { id } });
    return { message: 'Delete PromoCode successfully' };
  }
}

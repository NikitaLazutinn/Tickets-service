import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findRoleByName() {
    return this.prisma.role.findUnique({ where: { name: 'User' } });
  }

  async createRole(createRoleDto: CreateRoleDto, token: string) {
    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Access denied, user not Admin');
    }
    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
      },
    });
  }

  async getAllRoles(token: string) {
    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Access denied, user not Admin');
    }
    return this.prisma.role.findMany();
  }

  async create(createRoleDto: CreateRoleDto, token: string) {
    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Access denied, user not Admin');
    }
    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
      },
    });
  }

  async findOne(id: number, token: string) {
    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Access denied, user not Admin');
    }
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, token: string) {
    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Access denied, user not Admin');
    }
    const existingRole = await this.findOne(id, token);
    return this.prisma.role.update({
      where: { id: existingRole.id },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
      },
    });
  }

  async remove(id: number, token: string) {
    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Access denied, user not Admin');
    }
    const existingRole = await this.findOne(id, token);
    return this.prisma.role.delete({ where: { id: existingRole.id } });
  }
}

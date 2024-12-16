import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findRoleByName() {
    return this.prisma.role.findUnique({ where: { name: 'User' } });
  }

  async createRole(createRoleDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
      },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany();
  }

  async create(createRoleDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany();
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async updateUserRole(userId: number, roleName: string) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role with name ${roleName} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const existingRole = await this.findOne(id);
    return this.prisma.role.update({
      where: { id: existingRole.id },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
      },
    });
  }

  async remove(id: number) {
    const existingRole = await this.findOne(id);
    return this.prisma.role.delete({ where: { id: existingRole.id } });
  }
}

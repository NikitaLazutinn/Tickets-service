import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto, Update_UserDto } from './dto/create-user.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'prisma/prisma.service';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async checkData(dto, data) {
    const registerDto = plainToClass(dto, data);

    const errors = await validate(registerDto);
    if (errors.length > 0) {
      throw new BadRequestException('Invalid data format');
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
      },
    });
  }

  async findAll() {
    try {
      const all = await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return {
        statusCode: 200,
        users: all,
      };
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async find(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (user === null) {
      throw new NotFoundException(`There is no user with id: ${id}`);
    }
    return user;
  }

  async findById(id: number) {
    let user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        isVerified: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        createdCompanies: {
          select: {
            id: true,
            name: true,
          },
        },
        events: {
          select: {
            id: true,
            title: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (user === null) {
      throw new NotFoundException(`There is no user with id: ${id}`);
    }

    return {
      statusCode: 200,
      user: user,
    };
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updatePassword(email: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }

  async updateByEmail(
    email: string,
    updateData: Partial<{
      resetToken: string | null;
      resetTokenExpires: Date | null;
      roleId: number;
      password: string;
      isVerified: true;
    }>,
  ) {
    return this.prisma.user.update({
      where: { email },
      data: updateData,
    });
  }

  async update_user(id: number, UpdateUserDto: Update_UserDto, token_data) {
    await this.checkData(Update_UserDto, UpdateUserDto);
    const params = UpdateUserDto;
    if (token_data['roleId'] !== 1 && token_data['id'] !== id) {
      throw new NotFoundException();
    }

    await this.find(id);

    const updateData: { email?: string; name?: string; password?: string } = {};

    if (params.email?.length > 0) {
      updateData.email = params.email;
    }

    if (params.name?.length > 0) {
      updateData.name = params.name;
    }

    if (params.password?.length > 0) {
      updateData.password = params.password;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.user.update({
        where: { id: id },
        data: updateData,
      });
    }

    return {
      statusCode: 201,
      message: 'User updated successfully',
    };
  }

  async remove(id: number, token_data) {
    if (token_data['roleId'] !== 1 && token_data['id'] !== id) {
      throw new NotFoundException();
    }

    await this.find(id);

    await this.prisma.user.delete({ where: { id: id } });

    return {
      statusCode: 204,
      message: 'User deleted successfully',
    };
  }

  // async uploadProfilePhoto(
  //   userId: number,
  //   imageUrl: string,
  //   deleteHash: string,
  // ) {
  //   return this.prisma.user.update({
  //     where: { id: userId },
  //     data: { profilePhoto: imageUrl, deleteHash: deleteHash },
  //   });
  // }

  // async deleteProfilePhoto(userId: number) {
  //   return this.prisma.user.update({
  //     where: { id: userId },
  //     data: { profilePhoto: null, deleteHash: null },
  //   });
  // }

  // async updateProfilePhoto(
  //   userId: number,
  //   imageUrl: string,
  //   deleteHash: string,
  // ) {
  //   return this.prisma.user.update({
  //     where: { id: userId },
  //     data: { profilePhoto: imageUrl, deleteHash: deleteHash },
  //   });
  // }
}

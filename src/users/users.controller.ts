import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Update_UserDto } from './dto/create-user.dto';
import { AuthUserGuard } from 'src/guards';
import { request } from 'http';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(AuthUserGuard)
  @Get('all')
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthUserGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @UseGuards(AuthUserGuard)
  @Patch('edit/:id')
  async update(
    @Param('id') id: number,
    @Body() UpdateUserDto: Update_UserDto,
    @Req() request,
  ) {
    const tokenData = request.user;
    return this.userService.update_user(+id, UpdateUserDto, tokenData);
  }

  @UseGuards(AuthUserGuard)
  @Post('update-role/:id')
  async updateUserRole(
    @Req() req,
    @Param('id') userId: number,
    @Body('roleId') roleId: number,
  ) {
    const token = req.user;
    return this.userService.updateUserRole(userId, roleId, token);
  }

  @UseGuards(AuthUserGuard)
  @Delete('delete/:id')
  async remove(@Param('id') id: number, @Req() request) {
    const tokenData = request.user;
    return this.userService.remove(+id, tokenData);
  }
}

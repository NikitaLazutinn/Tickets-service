import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Update_UserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/guards';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('all')
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @UseGuards(AuthGuard)
  @Patch('edit/:id')
  async update(
    @Param('id') id: number,
    @Body() UpdateUserDto: Update_UserDto,
    @Req() request,
  ) {
    const tokenData = request.user;
    return this.userService.update_user(+id, UpdateUserDto, tokenData);
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  async remove(@Param('id') id: number, @Req() request) {
    const tokenData = request.user;
    return this.userService.remove(+id, tokenData);
  }

}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
// import { PostOwnershipGuard } from 'src/post/guards/postOwnership.guard';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  // @UseGuards(PostOwnershipGuard)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':userId/role')
  async changeUserRole(
    @Param('userId') userId: number,
    @Body('roleName') roleName: string,
  ) {
    return this.roleService.updateUserRole(userId, roleName);
  }

  @Patch(':id')
  // @UseGuards(PostOwnershipGuard)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  // @UseGuards(PostOwnershipGuard)
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthUserGuard } from 'src/guards';
// import { PostOwnershipGuard } from 'src/post/guards/postOwnership.guard';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(AuthUserGuard)
  @Post()
  create(@Req() req, @Body() createRoleDto: CreateRoleDto) {
    const token = req.user;
    return this.roleService.create(createRoleDto, token);
  }

  @UseGuards(AuthUserGuard)
  @Get()
  findAll(@Req() req) {
    const token = req.user;
    return this.roleService.getAllRoles(token);
  }

  @UseGuards(AuthUserGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const token = req.user;
    return this.roleService.findOne(+id, token);
  }

  @UseGuards(AuthUserGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req,
  ) {
    const token = req.user;
    return this.roleService.update(+id, updateRoleDto, token);
  }

  @UseGuards(AuthUserGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const token = req.user;
    return this.roleService.remove(+id, token);
  }
}

import {
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthUserGuard } from 'src/guards';
import { ImgurService } from './imgur.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('img')
export class ImgurController {
  constructor(private readonly imgurService: ImgurService) {}

  @UseGuards(AuthUserGuard)
  @Post('add-profile-photo')
  @UseInterceptors(FileInterceptor('profilePhoto'))
  async addProfilePhoto(
    @UploadedFile()
    file,
    @Req() request,
  ) {
    const tokenData = request.user;
    return this.imgurService.addProfilePhoto(file, tokenData);
  }

  @UseGuards(AuthUserGuard)
  @Patch('change-profile-photo')
  @UseInterceptors(FileInterceptor('profilePhoto'))
  async changeProfilePhoto(
    @UploadedFile()
    file,
    @Req() request,
  ) {
    const tokenData = request.user;
    return this.imgurService.changeProfilePhoto(file, tokenData);
  }

  @UseGuards(AuthUserGuard)
  @Delete('delete-profile-photo')
  async deleteProfilePhoto(@Req() request) {
    const tokenData = request.user;
    return this.imgurService.deleteProfilePhoto(tokenData);
  }

}

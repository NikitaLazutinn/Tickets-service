import {
  Controller,
  Delete,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards';
import { ImgurService } from './imgur.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('img')
export class ImgurController {
  constructor(private readonly imgurService: ImgurService) {}

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Delete('delete-profile-photo')
  async deleteProfilePhoto(@Req() request) {
    const tokenData = request.user;
    return this.imgurService.deleteProfilePhoto(tokenData);
  }


}

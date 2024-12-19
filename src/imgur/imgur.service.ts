import { UsersService } from 'src/users/users.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class ImgurService {
  constructor(private readonly userService: UsersService) {}

  private async uploadToImgur(file) {
    const formData = new FormData();
    formData.append('image', file.buffer, file.originalname);

    try {
      const response = await axios.post(
        `${process.env.IMGUR_URL}/upload`,
        formData,
        {
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
            ...formData.getHeaders(),
          },
        },
      );
      const { link, deletehash } = response.data?.data;
      if (link && deletehash) {
        return { link, deletehash };
      }
      throw new BadRequestException('Something went wrong');
    } catch (error) {
      throw new BadRequestException('Something went wrong');
    }
  }

  private async deleteImageFromImgur(deletehash: string) {
    console.log(process.env.IMGUR_URL);
    console.log(process.env.IMGUR_CLIENT_ID);
    console.log(process.env.IMGUR_CLIENT_SECRET);

    await axios.delete(`${process.env.IMGUR_URL}/image/${deletehash}`, {
      headers: { Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}` },
    });
  }

  async addProfilePhoto(file, token_data: string) {
    const userId = token_data['userId'];

    const user = await this.userService.find(userId);

    if (user.avatar) {
      throw new BadRequestException('Profile photo already exists');
    }

    const { link: uploadedImageUrl, deletehash } =
      await this.uploadToImgur(file);

    await this.userService.uploadProfilePhoto(
      userId,
      uploadedImageUrl,
      deletehash,
    );

    return { message: 'Profile photo has been added successfully!' };
  }

  async changeProfilePhoto(file, token_data: string) {
    const userId = token_data['userId'];

    const user = await this.userService.find(userId);

    if (!user.avatar) {
      throw new BadRequestException('Profile photo doesn`t exist');
    }

    console.log('1');
    await this.deleteImageFromImgur(user.deleteHash);
    console.log('2');
    const { link: uploadedImageUrl, deletehash } =
      await this.uploadToImgur(file);
    console.log('3');
    await this.userService.updateProfilePhoto(
      userId,
      uploadedImageUrl,
      deletehash,
    );
    console.log('4');
    return { message: 'Profile photo has been updated successfully!' };
  }

  async deleteProfilePhoto(token_data: string) {
    const userId = token_data['userId'];

    const user = await this.userService.find(userId);

    if (!user.avatar) {
      throw new BadRequestException('Profile photo doesn`t exist');
    }

    await this.deleteImageFromImgur(user.deleteHash);

    await this.userService.deleteProfilePhoto(userId);

    return { message: 'Profile photo has been deleted successfully!' };
  }
}

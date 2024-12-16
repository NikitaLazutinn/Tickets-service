import { Module } from '@nestjs/common';
import { ImgurService } from './imgur.service';
import { ImgurController } from './imgur.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ImgurController],
  providers: [ImgurService],
  imports: [UsersModule],
})
export class ImgurModule {}

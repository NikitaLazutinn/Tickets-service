import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ImgurModule } from './imgur/imgur.module';
import { EventsModule } from './events_/events.module';

@Module({
  imports: [AuthModule, RoleModule, UsersModule, PrismaModule, ImgurModule, EventsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

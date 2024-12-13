import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [AuthModule, RoleModule, UsersModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

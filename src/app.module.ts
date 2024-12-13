import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [AuthModule, RoleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

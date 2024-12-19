import { Module } from '@nestjs/common';
import { PromoCodeService } from './promo-code.service';
import { PromoCodeController } from './promo-code.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [PromoCodeController],
  providers: [PromoCodeService],
  imports: [PrismaModule],
})
export class PromoCodeModule {}

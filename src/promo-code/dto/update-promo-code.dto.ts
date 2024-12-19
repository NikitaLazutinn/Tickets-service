import { PartialType } from '@nestjs/mapped-types';
import { CreatePromoCodeDto } from './create-promo-code.dto';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePromoCodeDto extends PartialType(CreatePromoCodeDto) {
  @IsString()
  @IsOptional()
  code: string;

  @IsNumber()
  @IsOptional()
  discount: number;

  @IsDate()
  @IsOptional()
  expiration: Date;
}

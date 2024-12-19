import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  expiration: Date;

  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingDto } from './create-rating.dto';
import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class UpdateRatingDto extends PartialType(CreateRatingDto) {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  eventId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

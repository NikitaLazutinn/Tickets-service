import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateRatingDto {
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

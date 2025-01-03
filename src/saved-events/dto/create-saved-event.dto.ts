import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSavedEventDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  eventId: number;
}

import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsDate()
  date: Date;

  @IsBoolean()
  @IsOptional()
  isVisitorListPublic?: boolean;

}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

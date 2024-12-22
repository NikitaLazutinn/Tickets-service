import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
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

  @IsString()
  date: string;

  @IsNumber()
  companyId: number;

  @IsBoolean()
  @IsOptional()
  isVisitorListPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  notificationEnabled?: boolean;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

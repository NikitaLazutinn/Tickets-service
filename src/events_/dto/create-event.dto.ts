import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsObject,
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

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

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

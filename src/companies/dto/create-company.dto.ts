import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsString()
  date: string;

  @IsBoolean()
  @IsOptional()
  isVisitorListPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  notificationEnabled?: boolean;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

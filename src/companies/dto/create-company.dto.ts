import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  location: string;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

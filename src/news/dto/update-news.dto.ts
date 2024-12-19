import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateNewsDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @IsOptional()
  companyId?: number;
}

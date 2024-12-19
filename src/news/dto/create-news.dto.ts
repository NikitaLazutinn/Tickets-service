import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsNotEmpty()
  companyId: number;
}

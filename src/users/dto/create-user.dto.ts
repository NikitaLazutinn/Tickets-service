import { IsString } from 'class-validator';

export class CreateUserDto {
  token: string;
}

export class Update_UserDto {
  @IsString()
  name: string;
  @IsString()
  email: string;
  @IsString()
  password: string;
}

export class Delete_UserDto {
  id: number;
}

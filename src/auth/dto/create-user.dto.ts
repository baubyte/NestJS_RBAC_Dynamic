import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @IsString()
  username: string;
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsStrongPassword()
  password: string;
}

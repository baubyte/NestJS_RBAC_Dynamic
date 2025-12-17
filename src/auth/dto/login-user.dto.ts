import {
  IsString,
  MaxLength,
  MinLength,
  IsStrongPassword,
} from 'class-validator';

export class LoginUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsStrongPassword()
  password: string;
}

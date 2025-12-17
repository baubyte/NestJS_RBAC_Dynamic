import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Exists } from 'src/common/validators';
import { Role } from 'src/access-control/entities';

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

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Exists(Role, 'id', { each: true })
  role_ids?: number[];
}

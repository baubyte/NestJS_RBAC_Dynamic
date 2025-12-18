import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Exists } from 'src/common/validators';
import { Permission } from '../entities';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre único del rol',
    example: 'admin',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Slug único del rol (se convertirá a kebab-case)',
    example: 'content-editor',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  slug: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Editor de contenido con permisos de lectura y escritura',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    description: 'IDs de los permisos a asignar al rol',
    example: [1, 2, 3],
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Exists(Permission, 'id', {
    each: true,
    message: 'One or more permissions do not exist',
  })
  permission_ids?: number[];
}

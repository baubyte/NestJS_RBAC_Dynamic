import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';
import { Exists } from 'src/common/validators';
import { Permission } from '../entities';

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'IDs de los permisos a asignar/reemplazar en el rol',
    example: [1, 2, 3, 5],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Exists(Permission, 'id', {
    each: true,
    message: 'One or more permissions do not exist',
  })
  permission_ids: number[];
}

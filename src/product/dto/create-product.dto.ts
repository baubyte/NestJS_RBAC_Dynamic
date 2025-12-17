import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { Exists } from 'src/common/validators';

export class CreateProductDto {
  @ApiProperty({
    type: 'string',
    example: 'T-Shirt',
    description: 'Product name',
    minLength: 1,
    required: true,
  })
  @IsString()
  name: string;
  @ApiProperty({
    type: 'string',
    example: 'A comfortable t-shirt',
    description: 'Product description',
    minLength: 1,
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: 'number',
    example: 42,
    description: 'Product category ID',
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Exists('Category')
  category_id: number;
}

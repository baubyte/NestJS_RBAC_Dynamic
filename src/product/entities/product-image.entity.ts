import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'product_images' })
export class ProductImage {
  @ApiProperty({
    type: 'number',
    example: 1,
    description: 'Product Image ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: 'string',
    example: 'https://example.com/image.jpg',
    description: 'Product Image URL',
  })
  @Column('text')
  url: string;

  @ApiProperty({ type: () => Product })
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}

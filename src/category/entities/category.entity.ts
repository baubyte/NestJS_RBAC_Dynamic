import { Product } from 'src/product/entities';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @ApiProperty({
    description: 'Identificador único de la categoría',
    example: 1,
    readOnly: true,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Electrónica',
  })
  @Column('text')
  name: string;

  @ApiProperty({
    description: 'Productos asignados a esta categoría',
    type: () => [Product],
    required: false,
  })
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ApiProperty({
    description: 'Fecha de creación',
    type: String,
    format: 'date-time',
    readOnly: true,
    example: '2025-01-01T12:34:56.000Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    type: String,
    format: 'date-time',
    readOnly: true,
    example: '2025-01-02T12:34:56.000Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ApiProperty({
    description: 'Fecha de borrado lógico (si aplica)',
    type: String,
    format: 'date-time',
    nullable: true,
    required: false,
    example: null,
  })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}

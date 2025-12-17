import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  username: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column({
    type: 'json',
    default: '["admin"]',
  })
  roles: string[];
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

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLocaleLowerCase().trim();
  }

  @BeforeUpdate()
  emailToLowerCaseUpdate() {
    this.emailToLowerCase();
  }
}

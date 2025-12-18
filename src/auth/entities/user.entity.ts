import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from 'src/access-control/entities';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text', {
    unique: true,
  })
  username: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column({ default: true })
  is_active: boolean;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'users_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refresh_tokens: RefreshToken[];

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
  emailAndUsernameToLowerCase() {
    this.email = this.email.toLocaleLowerCase().trim();
    this.username = this.username.toLocaleLowerCase().trim();
  }

  @BeforeUpdate()
  emailAndUsernameToLowerCaseUpdate() {
    this.emailAndUsernameToLowerCase();
  }
}

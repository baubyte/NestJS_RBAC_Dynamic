import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string; // Example: 'users.create', 'products.delete'

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeSlug(): void {
    this.slug = this.slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.*-]/g, ''); // Permitir wildcards (*) y guiones
  }
}

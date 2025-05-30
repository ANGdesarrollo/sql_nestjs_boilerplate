import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';

import { PermissionEntity } from './PermissionSchema';

@Entity('roles')
export class RoleEntity
{
  @PrimaryGeneratedColumn('increment')
    id: number;

  @Column({ unique: true })
    name: string;

  @Column({ nullable: true })
    description: string;

  @ManyToMany(() => PermissionEntity)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id'
    }
  })
    permissions: PermissionEntity[];

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

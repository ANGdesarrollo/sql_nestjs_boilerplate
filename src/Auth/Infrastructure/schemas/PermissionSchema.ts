import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';

import { RoleEntity } from './RoleSchema';

@Entity('permissions')
export class PermissionEntity
{
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column({ unique: true })
    name: string;

  @Column({ nullable: true })
    description: string;

  @ManyToMany(() => RoleEntity, role => role.permissions)
    roles: RoleEntity[];

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

import { Entity, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';

import { RoleEntity } from './RoleSchema';
import { UserEntity } from './UserSchema';

@Entity('user_roles')
export class UserRoleEntity
{
  @PrimaryColumn({ name: 'user_id' })
    userId: string;

  @PrimaryColumn({ name: 'role_id' })
    roleId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
    user: UserEntity;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

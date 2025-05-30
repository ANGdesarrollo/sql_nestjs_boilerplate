import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { RoleEntity } from './RoleSchema';
import { UserEntity } from './UserSchema';

@Entity('user_roles')
export class UserRoleEntity
{
  @PrimaryColumn({ name: 'user_id', type: 'int' })
    userId: number;

  @PrimaryColumn({ name: 'role_id', type: 'int' })
    roleId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
    user: UserEntity;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

import { RoleEntity } from './RoleSchema';
import { UserEntity } from './UserSchema';

@Entity('user_roles')
export class UserRoleEntity
{
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: UserEntity;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

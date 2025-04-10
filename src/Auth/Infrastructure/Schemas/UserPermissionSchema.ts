import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

import { PermissionEntity } from './PermissionSchema';
import { UserEntity } from './UserSchema';

@Entity('user_permissions')
export class UserPermissionEntity
{
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: UserEntity;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
    permission: PermissionEntity;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

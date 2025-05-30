import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { PermissionEntity } from './PermissionSchema';
import { UserEntity } from './UserSchema';

@Entity('user_permissions')
export class UserPermissionEntity
{
  @PrimaryColumn({ name: 'user_id', type: 'int' })
    userId: number;

  @PrimaryColumn({ name: 'permission_id', type: 'int' })
    permissionId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
    user: UserEntity;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'permission_id' })
    permission: PermissionEntity;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

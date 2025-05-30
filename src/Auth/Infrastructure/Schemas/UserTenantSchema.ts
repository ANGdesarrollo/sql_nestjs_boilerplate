import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { TenantEntity } from './TenantSchema';
import { UserEntity } from './UserSchema';

@Entity('user_tenants')
export class UserTenantEntity
{
  @PrimaryColumn({ name: 'user_id', type: 'int' })
    userId: number;

  @PrimaryColumn({ name: 'tenant_id', type: 'int' })
    tenantId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
    user: UserEntity;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;

  @Column({ default: false })
    isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

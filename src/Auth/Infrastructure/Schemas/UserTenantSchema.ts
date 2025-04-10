import {
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
  PrimaryColumn
} from 'typeorm';

import { TenantEntity } from './TenantSchema';
import { UserEntity } from './UserSchema';

@Entity('user_tenants')
export class UserTenantEntity
{
  @PrimaryColumn('uuid', { name: 'user_id' })
    userId: string;

  @PrimaryColumn('uuid', { name: 'tenant_id' })
    tenantId: string;

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

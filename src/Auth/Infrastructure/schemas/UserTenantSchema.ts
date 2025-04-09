import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column } from 'typeorm';

import { TenantEntity } from './TenantSchema';
import { UserEntity } from './UserSchema';

@Entity('user_tenants')
export class UserTenantEntity
{
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: UserEntity;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;

  @Column({ default: false })
    isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

import { UserTenantEntity } from './UserTenantSchema';

@Entity('tenants')
export class TenantEntity
{
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column({ unique: true })
    name: string;

  @Column({ nullable: true })
    description: string;

  @Column({ unique: true })
    slug: string;

  @OneToMany(() => UserTenantEntity, userTenant => userTenant.tenant)
    userTenants: UserTenantEntity[];

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

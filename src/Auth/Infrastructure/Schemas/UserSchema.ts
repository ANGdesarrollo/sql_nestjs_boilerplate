import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

import { UserPermissionEntity } from './UserPermissionSchema';
import { UserRoleEntity } from './UserRoleSchema';
import { UserTenantEntity } from './UserTenantSchema';

@Entity('users')
export class UserEntity
{
  @PrimaryGeneratedColumn('increment')
    id: number;

  @Column({ unique: true })
    username: string;

  @Column()
    password: string;

  @OneToMany(() => UserRoleEntity, userRole => userRole.user)
    roles: UserRoleEntity[];

  @OneToMany(() => UserPermissionEntity, userPermission => userPermission.user)
    permissions: UserPermissionEntity[];

  @OneToMany(() => UserTenantEntity, userTenant => userTenant.user)
    tenants: UserTenantEntity[];

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

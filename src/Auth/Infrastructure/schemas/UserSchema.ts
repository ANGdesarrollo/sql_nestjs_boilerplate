import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

import { UserPermissionEntity } from './UserPermissionSchema';
import { UserRoleEntity } from './UserRoleSchema';
import { UserTenantEntity } from './UserTenantSchema';

@Entity('users')
export class UserEntity
{
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column({ unique: true })
    username: string;

  @Column()
    password: string;

  @OneToMany(() => UserRoleEntity, userRole => userRole.user)
    userRoles: UserRoleEntity[];

  @OneToMany(() => UserPermissionEntity, userPermission => userPermission.user)
    userPermissions: UserPermissionEntity[];

  @OneToMany(() => UserTenantEntity, userTenant => userTenant.user)
    userTenants: UserTenantEntity[];

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

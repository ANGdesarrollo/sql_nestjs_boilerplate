import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';

import { EnvService } from '../Config/Env/EnvService';

import { AuthUseCases } from './Application';
import { HashService } from './Domain/Services/HashService';
import { AuthRepositories } from './Infrastructure/repositories';
import { PermissionEntity } from './Infrastructure/schemas/PermissionSchema';
import { RoleEntity } from './Infrastructure/schemas/RoleSchema';
import { TenantEntity } from './Infrastructure/schemas/TenantSchema';
import { UserPermissionEntity } from './Infrastructure/schemas/UserPermissionSchema';
import { UserRoleEntity } from './Infrastructure/schemas/UserRoleSchema';
import { UserEntity } from './Infrastructure/schemas/UserSchema';
import { UserTenantEntity } from './Infrastructure/schemas/UserTenantSchema';
import { CreateSuperUserCliCommand } from './Presentation/Commands/CreateSuperUserCliCommand';
import { SyncRolesCliCommand } from './Presentation/Commands/SyncRolesCliCommand';
import { AuthControllers } from './Presentation/Controllers';
import { AuthGuard } from './Presentation/Guards/AuthGuard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.jwt.secret,
        signOptions: { expiresIn: envService.jwt.expiresIn }
      })
    })
  ],
  controllers: [...AuthControllers],
  providers: [
    ...AuthUseCases,
    ...AuthRepositories,
    HashService,
    AuthGuard,
    SyncRolesCliCommand,
    CreateSuperUserCliCommand,
    {
      provide: 'USER_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(UserEntity),
      inject: ['DATA_SOURCE']
    },
    {
      provide: 'ROLE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(RoleEntity),
      inject: ['DATA_SOURCE']
    },
    {
      provide: 'PERMISSION_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(PermissionEntity),
      inject: ['DATA_SOURCE']
    },
    {
      provide: 'USER_ROLE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(UserRoleEntity),
      inject: ['DATA_SOURCE']
    },
    {
      provide: 'USER_PERMISSION_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(UserPermissionEntity),
      inject: ['DATA_SOURCE']
    },
    {
      provide: 'TENANT_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(TenantEntity),
      inject: ['DATA_SOURCE']
    },
    {
      provide: 'USER_TENANT_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(UserTenantEntity),
      inject: ['DATA_SOURCE']
    }
  ],
  exports: [AuthGuard, JwtModule]
})
export class AuthModule {}

import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';

import { EnvService } from '../Config/Env/EnvService';

import { AuthUseCases } from './Application';
import { HashService } from './Domain/Services/HashService';
import { AuthRepositories } from './Infrastructure/Repositories';
import { PasswordRecoveryTokenRepository } from './Infrastructure/Repositories/PasswordRecoveryTokenRepository';
import { UserPermissionRepository } from './Infrastructure/Repositories/UserPermissionRepository';
import { UserRoleRepository } from './Infrastructure/Repositories/UserRoleRepository';
import { PermissionEntity } from './Infrastructure/Schemas/PermissionSchema';
import { RoleEntity } from './Infrastructure/Schemas/RoleSchema';
import { TenantEntity } from './Infrastructure/Schemas/TenantSchema';
import { UserPermissionEntity } from './Infrastructure/Schemas/UserPermissionSchema';
import { UserRoleEntity } from './Infrastructure/Schemas/UserRoleSchema';
import { UserEntity } from './Infrastructure/Schemas/UserSchema';
import { UserTenantEntity } from './Infrastructure/Schemas/UserTenantSchema';
import { CreateSuperUserCliCommand } from './Presentation/Commands/CreateSuperUserCliCommand';
import { SyncRolesCliCommand } from './Presentation/Commands/SyncRolesCliCommand';
import { AuthControllers } from './Presentation/Controllers';
import { AuthGuard } from './Presentation/Guards/AuthGuard';
import { PasswordRecoveryTokenEntity } from './Infrastructure/Schemas/PasswordRecoveryTokenSchema';

@Global()
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
    },
    {
      provide: 'PASSWORD_RECOVERY_TOKEN_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(PasswordRecoveryTokenEntity),
      inject: ['DATA_SOURCE']
    }
  ],
  exports: [AuthGuard, JwtModule,   UserRoleRepository, UserPermissionRepository]
})
export class AuthModule {}

import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from 'src/Auth/Domain/Services/HashService';
import { DataSource } from 'typeorm';

import { PermissionRepository } from '../src/Auth/Infrastructure/repositories/PermissionRepository';
import { RoleRepository } from '../src/Auth/Infrastructure/repositories/RoleRepository';
import { TenantRepository } from '../src/Auth/Infrastructure/repositories/TenantRepository';
import { UserPermissionRepository } from '../src/Auth/Infrastructure/repositories/UserPermissionRepository';
import { UserRepository } from '../src/Auth/Infrastructure/repositories/UserRepository';
import { UserRoleRepository } from '../src/Auth/Infrastructure/repositories/UserRoleRepository';
import { UserTenantRepository } from '../src/Auth/Infrastructure/repositories/UserTenantRepository';
import { PermissionEntity } from '../src/Auth/Infrastructure/schemas/PermissionSchema';
import { RoleEntity } from '../src/Auth/Infrastructure/schemas/RoleSchema';
import { TenantEntity } from '../src/Auth/Infrastructure/schemas/TenantSchema';
import { UserPermissionEntity } from '../src/Auth/Infrastructure/schemas/UserPermissionSchema';
import { UserRoleEntity } from '../src/Auth/Infrastructure/schemas/UserRoleSchema';
import { UserEntity } from '../src/Auth/Infrastructure/schemas/UserSchema';
import { UserTenantEntity } from '../src/Auth/Infrastructure/schemas/UserTenantSchema';

import { MockEnv } from './Mocks/MockEnvService';
import { testConfig } from './TestConfig';

interface TestModuleOptions {
  additionalProviders?: any[];
}

export async function createTestingModule(
  dataSource: DataSource,
  options: TestModuleOptions = {}
): Promise<TestingModule>
{
  const baseProviders = [
    HashService,
    {
      provide: JwtService,
      useFactory: () => new JwtService({
        secret: testConfig.jwt.secret,
        signOptions: { expiresIn: testConfig.jwt.expiresIn }
      })
    },
    {
      provide: 'DATA_SOURCE',
      useValue: dataSource
    },
    {
      provide: 'USER_REPOSITORY',
      useFactory: () => dataSource.getRepository(UserEntity)
    },
    {
      provide: 'TENANT_REPOSITORY',
      useFactory: () => dataSource.getRepository(TenantEntity)
    },
    {
      provide: 'USER_TENANT_REPOSITORY',
      useFactory: () => dataSource.getRepository(UserTenantEntity)
    },
    {
      provide: 'USER_ROLE_REPOSITORY',
      useFactory: () => dataSource.getRepository(UserRoleEntity)
    },
    {
      provide: 'USER_PERMISSION_REPOSITORY',
      useFactory: () => dataSource.getRepository(UserPermissionEntity)
    },
    {
      provide: 'ROLE_REPOSITORY',
      useFactory: () => dataSource.getRepository(RoleEntity)
    },
    {
      provide: 'PERMISSION_REPOSITORY',
      useFactory: () => dataSource.getRepository(PermissionEntity)
    },
    UserRepository,
    TenantRepository,
    UserTenantRepository,
    UserRoleRepository,
    UserPermissionRepository,
    RoleRepository,
    PermissionRepository,
    {
      provide: 'EnvService',
      useClass: MockEnv
    }
  ];

  const allProviders = [
    ...baseProviders,
    ...(options.additionalProviders || [])
  ];

  return Test.createTestingModule({
    providers: allProviders
  }).compile();
}

import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { CreateTenantUseCase } from '../../src/Auth/Application/CreateTenantUseCase';
import { CreateUserUseCase } from '../../src/Auth/Application/CreateUserUseCase';
import { GetMeUseCase } from '../../src/Auth/Application/GetMeUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { UserDomain } from '../../src/Auth/Domain/Entities/UserDomain';
import { PermissionRepository } from '../../src/Auth/Infrastructure/Repositories/PermissionRepository';
import { RoleRepository } from '../../src/Auth/Infrastructure/Repositories/RoleRepository';
import { TenantRepository } from '../../src/Auth/Infrastructure/Repositories/TenantRepository';
import { UserPermissionRepository } from '../../src/Auth/Infrastructure/Repositories/UserPermissionRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';
import { UserTenantRepository } from '../../src/Auth/Infrastructure/Repositories/UserTenantRepository';
import { Roles } from '../../src/Config/Roles';

import { CreateSuperUserFixture } from './Fixtures/CreateSuperUserFixture';
import { createTenantFixture } from './Fixtures/CreateTenantFixture';
import { CreateUserFixture } from './Fixtures/CreateUserFixture';

describe('GetMeUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let getMeUseCase: GetMeUseCase;
  let createUserUseCase: CreateUserUseCase;
  let createTenantUseCase: CreateTenantUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let userRepository: UserRepository;
  let tenantRepository: TenantRepository;
  let userTenantRepository: UserTenantRepository;
  let userPermissionRepository: UserPermissionRepository;
  let permissionRepository: PermissionRepository;
  let roleRepository: RoleRepository;

  let regularUser: UserDomain;
  let superUser: UserDomain;
  let tenantId: number;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    getMeUseCase = app.get(GetMeUseCase);
    createUserUseCase = app.get(CreateUserUseCase);
    createTenantUseCase = app.get(CreateTenantUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);
    userRepository = app.get(UserRepository);
    tenantRepository = app.get(TenantRepository);
    userTenantRepository = app.get(UserTenantRepository);
    userPermissionRepository = app.get(UserPermissionRepository);
    permissionRepository = app.get(PermissionRepository);
    roleRepository = app.get(RoleRepository);

    await syncRolesUseCase.execute();
  });

  beforeEach(async() =>
  {
    // Create tenant
    const tenantPayload = createTenantFixture();
    await createTenantUseCase.execute(tenantPayload);

    const tenants = await tenantRepository.list();
    const createdTenant = tenants.find(t => t.name === tenantPayload.name);

    if (!createdTenant)
    {
      throw new Error('Test setup failed: tenant not found');
    }

    tenantId = createdTenant.id;

    const superUserFixture = CreateSuperUserFixture();
    await createSuperUserUseCase.execute(superUserFixture);
    superUser = await userRepository.findOneBy({ username: superUserFixture.username }) as UserDomain;

    const userPayload = CreateUserFixture({
      tenantIds: [tenantId],
      defaultTenantId: tenantId
    });

    await createUserUseCase.execute(userPayload);
    regularUser = await userRepository.findOneBy({ username: userPayload.username }) as UserDomain;
  });

  describe('execute', () =>
  {
    it('should return user information with roles, permissions, and tenants for a regular user', async() =>
    {
      const result = await getMeUseCase.execute(regularUser.id);

      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(regularUser.id);
      expect(result.user.username).toBe(regularUser.username);
      expect(result.user.createdAt).toBeInstanceOf(Date);
      expect(result.user.updatedAt).toBeInstanceOf(Date);

      expect(result.roles).toBeInstanceOf(Array);
      expect(result.roles).toContain(Roles.USER);

      expect(result.permissions).toBeInstanceOf(Array);
      expect(result.permissions.length).toBeGreaterThan(0);

      expect(result.tenants).toBeInstanceOf(Array);
      expect(result.tenants.length).toBe(1);
      expect(result.tenants[0].id).toBe(tenantId);
      expect(result.tenants[0].isDefault).toBe(true);
    });

    it('should return user information with roles, permissions, and tenants for a super user', async() =>
    {
      const result = await getMeUseCase.execute(superUser.id);

      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(superUser.id);
      expect(result.user.username).toBe(superUser.username);

      expect(result.roles).toBeInstanceOf(Array);
      expect(result.roles.length).toBeGreaterThan(0);
      expect(result.roles).toContain(Roles.SUPER_ADMIN);

      expect(result.permissions).toBeInstanceOf(Array);

      expect(result.tenants).toBeInstanceOf(Array);
      expect(result.tenants.length).toBe(1);
      expect(result.tenants[0].isDefault).toBe(true);
    });

    it('should throw NotFoundException when user does not exist', async() =>
    {
      const nonExistentUserId = faker.number.int({
        min: 10000,
        max: 20000
      });

      await expect(getMeUseCase.execute(nonExistentUserId))
        .rejects.toThrow(NotFoundException);

      try
      {
        await getMeUseCase.execute(nonExistentUserId);
        fail('Expected NotFoundException to be thrown');
      }
      catch (error)
      {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`User with ID ${nonExistentUserId} not found`);
      }
    });

    it('should return user with multiple tenants when user is assigned to multiple tenants', async() =>
    {
      const tenantPayload2 = createTenantFixture();
      await createTenantUseCase.execute(tenantPayload2);

      const tenants = await tenantRepository.list();
      const secondTenant = tenants.find(t => t.name === tenantPayload2.name);

      if (!secondTenant)
      {
        throw new Error('Test setup failed: second tenant not found');
      }

      await userTenantRepository.create({
        userId: regularUser.id,
        tenantId: secondTenant.id,
        isDefault: false
      });

      const result = await getMeUseCase.execute(regularUser.id);

      expect(result.tenants).toBeInstanceOf(Array);
      expect(result.tenants.length).toBe(2);
      expect(result.tenants.some(t => t.id === tenantId)).toBe(true);
      expect(result.tenants.some(t => t.id === secondTenant.id)).toBe(true);

      const defaultTenant = result.tenants.find(t => t.isDefault);
      expect(defaultTenant).toBeDefined();
      expect(defaultTenant?.id).toBe(tenantId);
    });

    it('should include direct permissions assigned to the user', async() =>
    {
      const allPermissions = await permissionRepository.list();
      const userRole = await roleRepository.findOneBy({ name:  Roles.USER });
      const userRolePermissions = userRole?.permissions || [];
      const userRolePermissionIds = userRolePermissions.map(p => p.id);

      const unusedPermission = allPermissions.find(p => !userRolePermissionIds.includes(p.id));

      if (!unusedPermission)
      {
        throw new Error('Test setup failed: No unused permission found');
      }

      await userPermissionRepository.create({
        user: { id: regularUser.id } as UserDomain,
        permission: unusedPermission
      });

      const result = await getMeUseCase.execute(regularUser.id);

      expect(result.permissions).toContain(unusedPermission.name);
    });

    it('should properly handle users with no roles', async() =>
    {
      const username = faker.internet.email();
      const password = faker.internet.password();
      const userWithoutRoles = await userRepository.create({
        username,
        password
      });

      await userTenantRepository.create({
        userId: userWithoutRoles.id,
        tenantId,
        isDefault: true
      });

      const result = await getMeUseCase.execute(userWithoutRoles.id);

      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(userWithoutRoles.id);

      expect(result.roles).toBeInstanceOf(Array);
      expect(result.roles.length).toBe(0);

      expect(result.permissions).toBeInstanceOf(Array);
      expect(result.permissions.length).toBe(0);
    });

    it('should return correct structure and all expected fields', async() =>
    {
      const result = await getMeUseCase.execute(regularUser.id);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('roles');
      expect(result).toHaveProperty('permissions');
      expect(result).toHaveProperty('tenants');

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('username');
      expect(result.user).toHaveProperty('createdAt');
      expect(result.user).toHaveProperty('updatedAt');

      expect(result.tenants[0]).toHaveProperty('id');
      expect(result.tenants[0]).toHaveProperty('name');
      expect(result.tenants[0]).toHaveProperty('slug');
      expect(result.tenants[0]).toHaveProperty('isDefault');
    });
  });
});

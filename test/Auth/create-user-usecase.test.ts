import { faker } from '@faker-js/faker';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { CreateUserUseCase } from '../../src/Auth/Application/CreateUserUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { RoleRepository } from '../../src/Auth/Infrastructure/repositories/RoleRepository';
import { TenantRepository } from '../../src/Auth/Infrastructure/repositories/TenantRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/repositories/UserRepository';
import { UserRoleRepository } from '../../src/Auth/Infrastructure/repositories/UserRoleRepository';
import { UserTenantRepository } from '../../src/Auth/Infrastructure/repositories/UserTenantRepository';
import { Roles } from '../../src/Config/Roles';

import { CreateSuperUserFixture, SuperUserFixture } from './Fixtures/CreateSuperUserFixture';
import { CreateUserFixture } from './Fixtures/CreateUserFixture';

describe('CreateUserUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let createUserUseCase: CreateUserUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let userRepository: UserRepository;
  let tenantRepository: TenantRepository;
  let userTenantRepository: UserTenantRepository;
  let userRoleRepository: UserRoleRepository;
  let roleRepository: RoleRepository;
  let superUser: SuperUserFixture;
  let tenantId: string;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    createUserUseCase = app.get(CreateUserUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);
    userRepository = app.get(UserRepository);
    tenantRepository = app.get(TenantRepository);
    userTenantRepository = app.get(UserTenantRepository);
    userRoleRepository = app.get(UserRoleRepository);
    roleRepository = app.get(RoleRepository);
  });

  beforeEach(async() =>
  {
    await syncRolesUseCase.execute();

    superUser = CreateSuperUserFixture();
    await createSuperUserUseCase.execute(superUser);

    const tenant = await tenantRepository.findBySlug(superUser.tenantSlug);
    tenantId = tenant?.id as string;
  });

  describe('execute', () =>
  {
    it('should create a new user with the assigned tenant and default role', async() =>
    {
      const payload = CreateUserFixture({
        tenantIds: [tenantId],
        defaultTenantId: tenantId
      });

      await createUserUseCase.execute(payload);

      const user = await userRepository.findOneBy('username', payload.username);
      expect(user).toBeDefined();
      expect(user?.username).toBe(payload.username);

      const userTenants = await userTenantRepository.findUserTenants(user?.id as string);
      expect(userTenants).toHaveLength(1);
      expect(userTenants[0].tenant.id).toBe(tenantId);
      expect(userTenants[0].isDefault).toBe(true);

      const defaultRole = await roleRepository.findOneBy('name', Roles.USER);
      const userRoles = await userRoleRepository.getUserRoles(user?.id as string);
      expect(userRoles).toHaveLength(1);
      expect(userRoles[0].role.id).toBe(defaultRole?.id);
    });

    it('should throw ConflictException when user already exists', async() =>
    {
      const payload = CreateUserFixture({
        tenantIds: [tenantId],
        defaultTenantId: tenantId
      });

      await createUserUseCase.execute(payload);

      await expect(createUserUseCase.execute(payload))
        .rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when tenant does not exist', async() =>
    {
      const nonExistentTenantId = faker.string.uuid();
      const payload = CreateUserFixture({
        tenantIds: [nonExistentTenantId],
        defaultTenantId: nonExistentTenantId
      });

      await expect(createUserUseCase.execute(payload))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when default tenant is not in the tenant list', async() =>
    {
      const payload = CreateUserFixture({
        tenantIds: [tenantId],
        defaultTenantId: faker.string.uuid()
      });

      await expect(createUserUseCase.execute(payload))
        .rejects.toThrow(BadRequestException);
    });

    it('should create a user with multiple tenants', async() =>
    {
      const secondTenantName = faker.internet.domainName();
      const secondTenantSlug = faker.internet.domainName();
      const secondTenant = await tenantRepository.create({
        name: secondTenantName,
        slug: secondTenantSlug
      });

      const payload = CreateUserFixture({
        tenantIds: [tenantId, secondTenant.id],
        defaultTenantId: tenantId
      });

      await createUserUseCase.execute(payload);

      const user = await userRepository.findOneBy('username', payload.username);
      const userTenants = await userTenantRepository.findUserTenants(user?.id as string);

      expect(userTenants).toHaveLength(2);

      const defaultUserTenant = userTenants.find(ut => ut.isDefault);
      expect(defaultUserTenant).toBeDefined();
      expect(defaultUserTenant?.tenant.id).toBe(tenantId);

      const tenantIds = userTenants.map(ut => ut.tenant.id);
      expect(tenantIds).toContain(tenantId);
      expect(tenantIds).toContain(secondTenant.id);
    });
  });
});

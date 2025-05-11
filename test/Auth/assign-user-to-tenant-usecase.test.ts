import { faker } from '@faker-js/faker';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { AssignUserToTenantUseCase } from '../../src/Auth/Application/AssignUserToTenantUseCase';
import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { CreateTenantUseCase } from '../../src/Auth/Application/CreateTenantUseCase';
import { CreateUserUseCase } from '../../src/Auth/Application/CreateUserUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { TenantDomain } from '../../src/Auth/Domain/Entities/TenantDomain';
import { UserDomain } from '../../src/Auth/Domain/Entities/UserDomain';
import { TenantRepository } from '../../src/Auth/Infrastructure/Repositories/TenantRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';
import { UserTenantRepository } from '../../src/Auth/Infrastructure/Repositories/UserTenantRepository';

import { CreateSuperUserFixture } from './Fixtures/CreateSuperUserFixture';
import { createTenantFixture } from './Fixtures/CreateTenantFixture';
import { CreateUserFixture } from './Fixtures/CreateUserFixture';

describe('AssignUserToTenantUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let assignUserToTenantUseCase: AssignUserToTenantUseCase;
  let createUserUseCase: CreateUserUseCase;
  let createTenantUseCase: CreateTenantUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let userRepository: UserRepository;
  let tenantRepository: TenantRepository;
  let userTenantRepository: UserTenantRepository;

  let user: UserDomain;
  let tenant1: TenantDomain;
  let tenant2: TenantDomain;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    assignUserToTenantUseCase = app.get(AssignUserToTenantUseCase);
    createUserUseCase = app.get(CreateUserUseCase);
    createTenantUseCase = app.get(CreateTenantUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);
    userRepository = app.get(UserRepository);
    tenantRepository = app.get(TenantRepository);
    userTenantRepository = app.get(UserTenantRepository);

    await syncRolesUseCase.execute();
  });

  beforeEach(async() =>
  {
    // Create super user
    const superUser = CreateSuperUserFixture();
    await createSuperUserUseCase.execute(superUser);

    // Create two tenants
    const tenantPayload1 = createTenantFixture();
    const tenantPayload2 = createTenantFixture();

    // Create the tenants
    await createTenantUseCase.execute(tenantPayload1);
    await createTenantUseCase.execute(tenantPayload2);

    // Get all tenants from the database
    const tenants = await tenantRepository.list();

    // Look for tenants that match the names from our fixtures
    const matchedTenant1 = tenants.find(t => t.name === tenantPayload1.name);
    const matchedTenant2 = tenants.find(t => t.name === tenantPayload2.name);

    if (!matchedTenant1 || !matchedTenant2)
    {
      console.error('Tenants not found in the database!');
      console.log('Tenant names in fixtures:', tenantPayload1.name, tenantPayload2.name);
      console.log('Tenants in database:', tenants.map(t => `${t.name} (${t.slug})`));
      throw new Error('Test setup failed: tenants not found');
    }

    tenant1 = matchedTenant1;
    tenant2 = matchedTenant2;

    // Create a user with only one tenant assigned
    const userPayload = CreateUserFixture({
      tenantIds: [tenant1.id],
      defaultTenantId: tenant1.id
    });

    await createUserUseCase.execute(userPayload);
    user = await userRepository.findOneBy({ username : userPayload.username }) as UserDomain;
  });

  describe('execute', () =>
  {
    it('should assign a tenant to a user successfully', async() =>
    {
      const result = await assignUserToTenantUseCase.execute({
        userId: user.id,
        tenantId: tenant2.id
      });

      expect(result).toBeDefined();
      expect(result.user.id).toBe(user.id);
      expect(result.tenant.id).toBe(tenant2.id);
      expect(result.isDefault).toBe(false);

      // Verify that the tenant was actually assigned
      const userTenants = await userTenantRepository.findUserTenants(user.id);
      expect(userTenants.length).toBe(2);
      expect(userTenants.some(ut => ut.tenant.id === tenant1.id)).toBe(true);
      expect(userTenants.some(ut => ut.tenant.id === tenant2.id)).toBe(true);
    });

    it('should assign a tenant as default when setAsDefault is true', async() =>
    {
      const result = await assignUserToTenantUseCase.execute({
        userId: user.id,
        tenantId: tenant2.id,
        setAsDefault: true
      });

      expect(result).toBeDefined();
      expect(result.isDefault).toBe(true);

      // Verify that the tenant was set as default
      const defaultTenant = await userTenantRepository.getDefaultTenant(user.id);
      expect(defaultTenant).toBeDefined();
      expect(defaultTenant?.tenant.id).toBe(tenant2.id);

      // Verify that the previous default tenant is no longer default
      const userTenants = await userTenantRepository.findUserTenants(user.id);
      const tenant1Relation = userTenants.find(ut => ut.tenant.id === tenant1.id);
      expect(tenant1Relation?.isDefault).toBe(false);
    });

    it('should throw NotFoundException when user does not exist', async() =>
    {
      const nonExistentUserId = faker.string.uuid();

      await expect(assignUserToTenantUseCase.execute({
        userId: nonExistentUserId,
        tenantId: tenant2.id
      })).rejects.toThrow(NotFoundException);

      try
      {
        await assignUserToTenantUseCase.execute({
          userId: nonExistentUserId,
          tenantId: tenant2.id
        });
        fail('Expected NotFoundException to be thrown');
      }
      catch (error)
      {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`User with ID ${nonExistentUserId} not found`);
      }
    });

    it('should throw NotFoundException when tenant does not exist', async() =>
    {
      const nonExistentTenantId = faker.string.uuid();

      await expect(assignUserToTenantUseCase.execute({
        userId: user.id,
        tenantId: nonExistentTenantId
      })).rejects.toThrow(NotFoundException);

      try
      {
        await assignUserToTenantUseCase.execute({
          userId: user.id,
          tenantId: nonExistentTenantId
        });
        fail('Expected NotFoundException to be thrown');
      }
      catch (error)
      {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Tenant with ID ${nonExistentTenantId} not found`);
      }
    });

    it('should throw ConflictException when user is already assigned to the tenant', async() =>
    {
      await expect(assignUserToTenantUseCase.execute({
        userId: user.id,
        tenantId: tenant1.id
      })).rejects.toThrow(ConflictException);

      try
      {
        await assignUserToTenantUseCase.execute({
          userId: user.id,
          tenantId: tenant1.id
        });
        fail('Expected ConflictException to be thrown');
      }
      catch (error)
      {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('User is already assigned to this tenant');
      }
    });

    it('should handle multiple tenant assignments correctly', async() =>
    {
      // Create a third tenant
      const tenantPayload3 = createTenantFixture();
      await createTenantUseCase.execute(tenantPayload3);
      const tenants = await tenantRepository.list();
      const tenant3 = tenants.find(t => t.name === tenantPayload3.name) as TenantDomain;

      // Assign tenant2
      await assignUserToTenantUseCase.execute({
        userId: user.id,
        tenantId: tenant2.id
      });

      // Assign tenant3
      await assignUserToTenantUseCase.execute({
        userId: user.id,
        tenantId: tenant3.id,
        setAsDefault: true
      });

      // Verify all tenant assignments
      const userTenants = await userTenantRepository.findUserTenants(user.id);
      expect(userTenants.length).toBe(3);

      // Verify default tenant
      const defaultTenant = await userTenantRepository.getDefaultTenant(user.id);
      expect(defaultTenant?.tenant.id).toBe(tenant3.id);
    });

    it('should create userTenant relation with correct properties', async() =>
    {
      const result = await assignUserToTenantUseCase.execute({
        userId: user.id,
        tenantId: tenant2.id
      });

      // Verify essential properties without checking for id
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tenant');
      expect(result).toHaveProperty('isDefault');
      expect(result).toHaveProperty('createdAt');

      // Verify relationship properties
      expect(result.user).toBeDefined();
      expect(result.tenant).toBeDefined();
      expect(result.user.id).toBe(user.id);
      expect(result.tenant.id).toBe(tenant2.id);
      expect(result.isDefault).toBe(false);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
});

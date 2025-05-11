import { faker } from '@faker-js/faker';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { CreateTenantUseCase } from '../../src/Auth/Application/CreateTenantUseCase';
import { CreateUserUseCase } from '../../src/Auth/Application/CreateUserUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { UpdateUserUseCase } from '../../src/Auth/Application/UpdateUserUseCase';
import { TenantDomain } from '../../src/Auth/Domain/Entities/TenantDomain';
import { UserDomain } from '../../src/Auth/Domain/Entities/UserDomain';
import { HashService } from '../../src/Auth/Domain/Services/HashService';
import { TenantRepository } from '../../src/Auth/Infrastructure/Repositories/TenantRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';
import { UserTenantRepository } from '../../src/Auth/Infrastructure/Repositories/UserTenantRepository';

import { CreateSuperUserFixture } from './Fixtures/CreateSuperUserFixture';
import { createTenantFixture } from './Fixtures/CreateTenantFixture';
import { CreateUserFixture } from './Fixtures/CreateUserFixture';

describe('UpdateUserUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let updateUserUseCase: UpdateUserUseCase;
  let createUserUseCase: CreateUserUseCase;
  let createTenantUseCase: CreateTenantUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let userRepository: UserRepository;
  let tenantRepository: TenantRepository;
  let userTenantRepository: UserTenantRepository;
  let hashService: HashService;

  let user: UserDomain;
  let tenant1: TenantDomain;
  let tenant2: TenantDomain;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    updateUserUseCase = app.get(UpdateUserUseCase);
    createUserUseCase = app.get(CreateUserUseCase);
    createTenantUseCase = app.get(CreateTenantUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);
    userRepository = app.get(UserRepository);
    tenantRepository = app.get(TenantRepository);
    userTenantRepository = app.get(UserTenantRepository);
    hashService = app.get(HashService);

    await syncRolesUseCase.execute();
  });

  beforeEach(async() =>
  {
    await syncRolesUseCase.execute();

    // Create super user
    const superUser = CreateSuperUserFixture();
    await createSuperUserUseCase.execute(superUser);

    // Create two tenants
    const tenantPayload1 = createTenantFixture();
    const tenantPayload2 = createTenantFixture();

    // Create the tenants and get their IDs from the response
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
    }

    tenant1 = matchedTenant1 as TenantDomain;
    tenant2 = matchedTenant2 as TenantDomain;

    if (tenant1 && tenant2)
    {
      const userPayload = CreateUserFixture({
        tenantIds: [tenant1.id],
        defaultTenantId: tenant1.id
      });

      await createUserUseCase.execute(userPayload);
      user = await userRepository.findOneBy({ username: userPayload.username }) as UserDomain;
    }
    else
    {
      throw new Error('Failed to create test tenants');
    }
  });
  describe('execute', () =>
  {
    it('should update username successfully', async() =>
    {
      const newUsername = faker.internet.email();

      await updateUserUseCase.execute({
        id: user.id,
        username: newUsername
      });

      const updatedUser = await userRepository.findOneBy({ id: user.id });
      expect(updatedUser?.username).toBe(newUsername);
    });

    it('should update password successfully', async() =>
    {
      const newPassword = faker.internet.password();

      await updateUserUseCase.execute({
        id: user.id,
        password: newPassword
      });

      const updatedUser = await userRepository.findOneBy({ id: user.id });
      const isPasswordValid = await hashService.compare(newPassword, updatedUser?.password as string);
      expect(isPasswordValid).toBe(true);
    });

    it('should add a tenant to user successfully', async() =>
    {
      await updateUserUseCase.execute({
        id: user.id,
        tenantChanges: {
          addTenantIds: [tenant2.id]
        }
      });

      const userTenants = await userTenantRepository.findUserTenants(user.id);
      expect(userTenants.length).toBe(2);
      expect(userTenants.some(ut => ut.tenant.id === tenant1.id)).toBe(true);
      expect(userTenants.some(ut => ut.tenant.id === tenant2.id)).toBe(true);
    });

    it('should throw ConflictException when adding an already assigned tenant to the user', async() =>
    {
      await expect(updateUserUseCase.execute({
        id: user.id,
        tenantChanges: {
          addTenantIds: [tenant1.id]
        }
      })).rejects.toThrow(ConflictException);

      try
      {
        await updateUserUseCase.execute({
          id: user.id,
          tenantChanges: {
            addTenantIds: [tenant1.id]
          }
        });
        fail('Expected ConflictException to be thrown');
      }
      catch (error)
      {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(`User is already assigned to tenant with ID ${tenant1.id}`);
      }
    });

    it('should remove a tenant from user successfully', async() =>
    {
      // First add tenant2
      await updateUserUseCase.execute({
        id: user.id,
        tenantChanges: {
          addTenantIds: [tenant2.id]
        }
      });

      // Then remove tenant1
      await updateUserUseCase.execute({
        id: user.id,
        tenantChanges: {
          removeTenantIds: [tenant1.id]
        }
      });

      const userTenants = await userTenantRepository.findUserTenants(user.id);
      expect(userTenants.length).toBe(1);
      expect(userTenants[0].tenant.id).toBe(tenant2.id);
    });

    it('should change default tenant successfully', async() =>
    {
      // First add tenant2
      await updateUserUseCase.execute({
        id: user.id,
        tenantChanges: {
          addTenantIds: [tenant2.id]
        }
      });

      // Then set tenant2 as default
      await updateUserUseCase.execute({
        id: user.id,
        tenantChanges: {
          defaultTenantId: tenant2.id
        }
      });

      const defaultTenant = await userTenantRepository.getDefaultTenant(user.id);
      expect(defaultTenant?.tenant.id).toBe(tenant2.id);
    });

    it('should throw NotFoundException when user does not exist', async() =>
    {
      const nonExistentId = faker.string.uuid();

      await expect(updateUserUseCase.execute({
        id: nonExistentId,
        username: faker.internet.email()
      })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating to a username that already exists', async() =>
    {
      // Create another user
      const anotherUserPayload = CreateUserFixture({
        tenantIds: [tenant1.id],
        defaultTenantId: tenant1.id
      });

      await createUserUseCase.execute(anotherUserPayload);

      // Try to update user's username to the other user's username
      await expect(updateUserUseCase.execute({
        id: user.id,
        username: anotherUserPayload.username
      })).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when trying to add non-existent tenant', async() =>
    {
      const nonExistentId = faker.string.uuid();

      await expect(updateUserUseCase.execute({
        id: user.id,
        tenantChanges: {
          addTenantIds: [nonExistentId]
        }
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to remove non-assigned tenant', async() =>
    {
      await expect(updateUserUseCase.execute({
        id: user.id,
        tenantChanges: {
          removeTenantIds: [tenant2.id]
        }
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to set default tenant user doesnt have', async() =>
    {
      await expect(updateUserUseCase.execute({
        id: user.id,
        tenantChanges: {
          defaultTenantId: tenant2.id
        }
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to remove all tenants', async() =>
    {
      await expect(updateUserUseCase.execute({
        id: user.id,
        tenantChanges: {
          removeTenantIds: [tenant1.id]
        }
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no fields are provided for update', async() =>
    {
      await expect(updateUserUseCase.execute({
        id: user.id
      })).rejects.toThrow(BadRequestException);
    });

    it('should update multiple fields at once', async() =>
    {
      const newUsername = faker.internet.email();
      const newPassword = faker.internet.password();

      await updateUserUseCase.execute({
        id: user.id,
        username: newUsername,
        password: newPassword,
        tenantChanges: {
          addTenantIds: [tenant2.id],
          defaultTenantId: tenant2.id
        }
      });

      const updatedUser = await userRepository.findOneBy({  id: user.id });
      const isPasswordValid = await hashService.compare(newPassword, updatedUser?.password as string);

      expect(updatedUser?.username).toBe(newUsername);
      expect(isPasswordValid).toBe(true);

      const userTenants = await userTenantRepository.findUserTenants(user.id);
      expect(userTenants.length).toBe(2);

      const defaultTenant = await userTenantRepository.getDefaultTenant(user.id);
      expect(defaultTenant?.tenant.id).toBe(tenant2.id);
    });
  });
});

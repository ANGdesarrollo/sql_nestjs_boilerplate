import { faker } from '@faker-js/faker';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { CreateUserUseCase } from '../../src/Auth/Application/CreateUserUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { HashService } from '../../src/Auth/Domain/Services/HashService';
import { RoleRepository } from '../../src/Auth/Infrastructure/Repositories/RoleRepository';
import { TenantRepository } from '../../src/Auth/Infrastructure/Repositories/TenantRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';
import { UserRoleRepository } from '../../src/Auth/Infrastructure/Repositories/UserRoleRepository';
import { UserTenantRepository } from '../../src/Auth/Infrastructure/Repositories/UserTenantRepository';
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
  let tenantId: number;
  let dataSource: DataSource;
  let hashService: HashService;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;
    dataSource = testEnv.dataSource;

    createUserUseCase = app.get(CreateUserUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);
    userRepository = app.get(UserRepository);
    tenantRepository = app.get(TenantRepository);
    userTenantRepository = app.get(UserTenantRepository);
    userRoleRepository = app.get(UserRoleRepository);
    roleRepository = app.get(RoleRepository);
    hashService = app.get(HashService);
  });

  beforeEach(async() =>
  {
    await syncRolesUseCase.execute();

    superUser = CreateSuperUserFixture();
    await createSuperUserUseCase.execute(superUser);

    const tenant = await tenantRepository.findBySlug(superUser.tenantSlug);
    tenantId = tenant?.id as number;
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

      const user = await userRepository.findOneBy({ username: payload.username });
      expect(user).toBeDefined();
      expect(user?.username).toBe(payload.username);

      const userTenants = await userTenantRepository.findUserTenants(user?.id as number);
      expect(userTenants).toHaveLength(1);
      expect(userTenants[0].tenant.id).toBe(tenantId);
      expect(userTenants[0].isDefault).toBe(true);

      const defaultRole = await roleRepository.findOneBy({ name : Roles.USER });
      const userRoles = await userRoleRepository.getUserRoles(user?.id as number);
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
      const nonExistentTenantId = faker.number.int({
        min: 10000,
        max: 20000
      });

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
        defaultTenantId: faker.number.int({
          min: 10000,
          max: 20000
        })
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

      const user = await userRepository.findOneBy({ username: payload.username });
      const userTenants = await userTenantRepository.findUserTenants(user?.id as number);

      expect(userTenants).toHaveLength(2);

      const defaultUserTenant = userTenants.find(ut => ut.isDefault);
      expect(defaultUserTenant).toBeDefined();
      expect(defaultUserTenant?.tenant.id).toBe(tenantId);

      const tenantIds = userTenants.map(ut => ut.tenant.id);
      expect(tenantIds).toContain(tenantId);
      expect(tenantIds).toContain(secondTenant.id);
    });

    // New test case: Default user role not found
    it('should throw BadRequestException when default user role is not found', async() =>
    {
      // We need to mock at the transaction level since the code uses transactions
      const mockUserRoleRepo = {
        create: jest.fn(),
        withTransaction: jest.fn().mockReturnValue({
          create: jest.fn()
        })
      };

      const mockRoleRepo = {
        findOneBy: jest.fn().mockResolvedValue(null),
        withTransaction: jest.fn().mockReturnValue({
          findOneBy: jest.fn().mockResolvedValue(null)
        })
      };

      // Mock other required repositories
      const mockUserRepo = {
        create: jest.fn(),
        findOneBy: jest.fn().mockResolvedValue(null),
        withTransaction: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({ id: 'mock-user-id' })
        })
      };

      const mockUserTenantRepo = {
        createMany: jest.fn(),
        withTransaction: jest.fn().mockReturnValue({
          createMany: jest.fn()
        })
      };

      // Create a custom instance of CreateUserUseCase with mocked dependencies
      const customCreateUserUseCase = new CreateUserUseCase(
        mockUserRepo as any,
        tenantRepository,
        mockUserTenantRepo as any,
        mockRoleRepo as any,
        mockUserRoleRepo as any,
        hashService,
        dataSource
      );

      const payload = CreateUserFixture({
        tenantIds: [tenantId],
        defaultTenantId: tenantId
      });

      await expect(customCreateUserUseCase.execute(payload))
        .rejects.toThrow('Default user role not found. Make sure to run the sync:roles command');
    });

    // Testing the username conflict case again with more specific assertion
    it('should throw ConflictException with correct message when username already exists', async() =>
    {
      const payload = CreateUserFixture({
        tenantIds: [tenantId],
        defaultTenantId: tenantId
      });

      await createUserUseCase.execute(payload);

      // Use try-catch to capture the exact error message
      try
      {
        await createUserUseCase.execute(payload);
        fail('Expected ConflictException to be thrown');
      }
      catch (error)
      {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(`User with username '${payload.username}' already exists`);
      }
    });

    it('should throw BadRequestException when some tenantIds do not exist in the database', async() =>
    {
      const fakeTenantId = faker.number.int({
        min: 10000,
        max: 20000
      });

      const payload = CreateUserFixture({
        tenantIds: [tenantId, fakeTenantId],
        defaultTenantId: tenantId
      });

      await expect(createUserUseCase.execute(payload))
        .rejects.toThrow(`Tenants with IDs ${fakeTenantId} not found`);
    });
  });
});

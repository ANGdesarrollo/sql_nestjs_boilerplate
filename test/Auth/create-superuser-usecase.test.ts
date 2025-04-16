import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { TenantDomain } from '../../src/Auth/Domain/Entities/TenantDomain';
import { HashService } from '../../src/Auth/Domain/Services/HashService';
import { RoleRepository } from '../../src/Auth/Infrastructure/Repositories/RoleRepository';
import { TenantRepository } from '../../src/Auth/Infrastructure/Repositories/TenantRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';
import { UserRoleRepository } from '../../src/Auth/Infrastructure/Repositories/UserRoleRepository';
import { UserTenantRepository } from '../../src/Auth/Infrastructure/Repositories/UserTenantRepository';
import { Roles } from '../../src/Config/Roles';

import { CreateSuperUserFixture } from './Fixtures/CreateSuperUserFixture';

describe('CreateSuperUserUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let userRepository: UserRepository;
  let tenantRepository: TenantRepository;
  let userTenantRepository: UserTenantRepository;
  let userRoleRepository: UserRoleRepository;
  let roleRepository: RoleRepository;
  let hashService: HashService;
  let dataSource: DataSource;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;
    dataSource = testEnv.dataSource;

    createSuperUserUseCase = app.get(CreateSuperUserUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    userRepository = app.get(UserRepository);
    tenantRepository = app.get(TenantRepository);
    userTenantRepository = app.get(UserTenantRepository);
    userRoleRepository = app.get(UserRoleRepository);
    roleRepository = app.get(RoleRepository);
    hashService = app.get(HashService);

    await syncRolesUseCase.execute();
  });

  describe('execute', () =>
  {
    const expectTenantData = (userDomain: any, expected: { name: string; slug: string; id?: string }) =>
    {
      const tenant = userDomain.tenants?.[0];
      expect(tenant).toBeDefined();
      expect(tenant?.name).toBe(expected.name);
      expect(tenant?.slug).toBe(expected.slug);

      expect(userDomain.tenants).toHaveLength(1);
      expect(userDomain.tenants[0].id).toBe(expected.id ?? tenant?.id);
      expect(userDomain.tenants[0].isDefault).toBe(true);
    };

    const expectUserHasRole = async(
      userId: string,
      expectedRoleName: string,
      roleRepo: RoleRepository,
      userRoleRepo: UserRoleRepository
    ) =>
    {
      const expectedRole = await roleRepo.findOneBy('name', expectedRoleName);
      expect(expectedRole).toBeDefined();

      const userRoles = await userRoleRepo.getUserRoles(userId);
      expect(userRoles).toHaveLength(1);
      expect(userRoles[0].role.id).toBe(expectedRole?.id);
    };

    it('should create a super admin user with default values when no config is provided', async() =>
    {
      await createSuperUserUseCase.execute();

      const user = await userRepository.findOneBy('username', 'superadmin@node.com');
      expect(user?.username).toBe('superadmin@node.com');

      const userDomain = await userRepository.findUserWithRelations(user?.id as string);

      expectTenantData(userDomain, { name: 'System', slug: 'system' });
      await expectUserHasRole(user?.id as string, Roles.SUPER_ADMIN, roleRepository, userRoleRepository);
    });

    it('should create a super admin user with custom values when config is provided', async() =>
    {
      const superUserConfig = CreateSuperUserFixture();

      await createSuperUserUseCase.execute(superUserConfig);

      const user = await userRepository.findOneBy('username', superUserConfig.username);
      expect(user?.username).toBe(superUserConfig.username);

      const userDomain = await userRepository.findUserWithRelations(user?.id as string);
      const isPasswordValid = await hashService.compare(superUserConfig.password, user?.password as string);
      expect(isPasswordValid).toBe(true);

      expectTenantData(userDomain, {
        name: superUserConfig.tenantName,
        slug: superUserConfig.tenantSlug
      });

      await expectUserHasRole(user?.id as string, Roles.SUPER_ADMIN, roleRepository, userRoleRepository);
    });

    it('should use existing tenant if it already exists', async() =>
    {
      const existingTenant: TenantDomain = await tenantRepository.create({
        name: 'Existing Tenant',
        slug: 'existing-tenant',
        description: 'This is a pre-existing tenant'
      });

      const superUserConfig = {
        username: faker.internet.username(),
        password: faker.internet.password(),
        tenantName: 'Different Name',
        tenantSlug: 'existing-tenant'
      };

      await createSuperUserUseCase.execute(superUserConfig);

      const user = await userRepository.findOneBy('username', superUserConfig.username);
      const userDomain = await userRepository.findUserWithRelations(user?.id as string);

      expectTenantData(userDomain, {
        name: 'Existing Tenant',
        slug: 'existing-tenant',
        id: existingTenant.id
      });
    });

    it('should not create duplicate super user with same username', async() =>
    {
      const superUserConfig = CreateSuperUserFixture();

      await createSuperUserUseCase.execute(superUserConfig);

      const usersBefore = await userRepository.list();
      const countBefore = usersBefore.length;

      await createSuperUserUseCase.execute(superUserConfig);

      const usersAfter = await userRepository.list();
      expect(usersAfter.length).toBe(countBefore);

      const usersWithSameUsername = usersAfter.filter(u => u.username === superUserConfig.username);
      expect(usersWithSameUsername.length).toBe(1);
    });

    it('should throw BadRequestException when super admin role is not found', async() =>
    {
      const mockRoleRepo = {
        findOneBy: jest.fn().mockResolvedValue(null),
        withTransaction: jest.fn().mockReturnValue({
          findOneBy: jest.fn().mockResolvedValue(null)
        })
      };

      const customCreateSuperUserUseCase = new CreateSuperUserUseCase(
        userRepository,
        tenantRepository,
        userTenantRepository,
        mockRoleRepo as any,
        userRoleRepository,
        hashService,
        dataSource
      );

      await expect(customCreateSuperUserUseCase.execute())
        .rejects.toThrow('Super admin role not found. Make sure to run the sync:roles command first');
    });

    it('should generate a random password when none is provided', async() =>
    {
      const superUserConfig = {
        username: faker.internet.username(),
        tenantName: faker.company.name(),
        tenantSlug: faker.helpers.slugify(faker.company.name().toLowerCase())
      };

      await createSuperUserUseCase.execute(superUserConfig);

      const user = await userRepository.findOneBy('username', superUserConfig.username);
      expect(user?.password).toBeTruthy();
      expect(user?.password.length).toBeGreaterThan(0);

      const userDomain = await userRepository.findUserWithRelations(user?.id as string);
      expectTenantData(userDomain, {
        name: superUserConfig.tenantName,
        slug: superUserConfig.tenantSlug
      });
    });
  });
});

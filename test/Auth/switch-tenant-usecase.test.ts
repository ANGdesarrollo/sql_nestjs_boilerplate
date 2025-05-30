import { faker } from '@faker-js/faker';
import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { CreateTenantUseCase } from '../../src/Auth/Application/CreateTenantUseCase';
import { SwitchTenantUseCase } from '../../src/Auth/Application/SwitchTenantUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { TenantDomain } from '../../src/Auth/Domain/Entities/TenantDomain';
import { UserDomain } from '../../src/Auth/Domain/Entities/UserDomain';
import { JwtPayload } from '../../src/Auth/Domain/Payloads/JwtPayload';
import { TenantRepository } from '../../src/Auth/Infrastructure/Repositories/TenantRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';
import { UserTenantRepository } from '../../src/Auth/Infrastructure/Repositories/UserTenantRepository';

import { CreateSuperUserFixture } from './Fixtures/CreateSuperUserFixture';
import { createTenantFixture } from './Fixtures/CreateTenantFixture';

describe('SwitchTenantUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let switchTenantUseCase: SwitchTenantUseCase;
  let createTenantUseCase: CreateTenantUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let userRepository: UserRepository;
  let tenantRepository: TenantRepository;
  let userTenantRepository: UserTenantRepository;
  let jwtService: JwtService;

  let user: UserDomain;
  let tenant1: TenantDomain;
  let tenant2: TenantDomain;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    switchTenantUseCase = app.get(SwitchTenantUseCase);
    createTenantUseCase = app.get(CreateTenantUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);
    userRepository = app.get(UserRepository);
    tenantRepository = app.get(TenantRepository);
    userTenantRepository = app.get(UserTenantRepository);
    jwtService = app.get(JwtService);

    await syncRolesUseCase.execute();
  });

  beforeEach(async() =>
  {
    const superUserFixture = CreateSuperUserFixture();
    await createSuperUserUseCase.execute(superUserFixture);

    user = await userRepository.findOneBy({ username: superUserFixture.username }) as UserDomain;

    const userTenants = await userTenantRepository.findUserTenants(user.id);
    tenant1 = userTenants[0].tenant;

    const tenantPayload = createTenantFixture();
    await createTenantUseCase.execute(tenantPayload);

    const tenants = await tenantRepository.list();
    tenant2 = tenants.find(t => t.name === tenantPayload.name) as TenantDomain;

    await userTenantRepository.create({
      userId: user.id,
      tenantId: tenant2.id,
      isDefault: false
    });
  });

  describe('execute', () =>
  {
    it('should generate a new JWT token when switching to a valid tenant', async() =>
    {
      // Arrange
      const payload = {
        userId: user.id,
        tenantId: tenant2.id
      };

      const token = await switchTenantUseCase.execute(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decodedToken = jwtService.verify<JwtPayload>(token);
      expect(decodedToken.userId).toBe(user.id);
      expect(decodedToken.tenantId).toBe(tenant2.id);
    });

    it('should throw ForbiddenException when user does not have access to the tenant', async() =>
    {
      const nonAccessibleTenantId = faker.number.int({
        min: 10000,
        max: 20000
      });

      const payload = {
        userId: user.id,
        tenantId: nonAccessibleTenantId
      };

      await expect(switchTenantUseCase.execute(payload))
        .rejects.toThrow(ForbiddenException);

      try
      {
        await switchTenantUseCase.execute(payload);
        fail('Expected ForbiddenException to be thrown');
      }
      catch (error)
      {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('User does not have access to the requested tenant');
      }
    });


    it('should allow switching to any tenant assigned to the user', async() =>
    {
      const payload1 = {
        userId: user.id,
        tenantId: tenant2.id
      };
      const token1 = await switchTenantUseCase.execute(payload1);

      const payload2 = {
        userId: user.id,
        tenantId: tenant1.id
      };
      const token2 = await switchTenantUseCase.execute(payload2);

      const decodedToken1 = jwtService.verify<JwtPayload>(token1);
      const decodedToken2 = jwtService.verify<JwtPayload>(token2);

      expect(decodedToken1.tenantId).toBe(tenant2.id);
      expect(decodedToken2.tenantId).toBe(tenant1.id);
    });
  });
});

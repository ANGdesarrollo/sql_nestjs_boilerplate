import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { GetUserUseCase } from '../../src/Auth/Application/GetUserUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { UserDomain } from '../../src/Auth/Domain/Entities/UserDomain';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';

import { CreateSuperUserFixture } from './Fixtures/CreateSuperUserFixture';

describe('GetUserUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let getUserUseCase: GetUserUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let userRepository: UserRepository;
  let testUser: UserDomain;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    getUserUseCase = app.get(GetUserUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    userRepository = app.get(UserRepository);

    await syncRolesUseCase.execute();
  });

  beforeEach(async() =>
  {
    const superUserFixture = CreateSuperUserFixture();
    await createSuperUserUseCase.execute(superUserFixture);

    testUser = await userRepository.findOneBy({ username: superUserFixture.username }) as UserDomain;
  });

  describe('execute', () =>
  {
    it('should return a user with relations when user exists', async() =>
    {
      // Act
      const result = await getUserUseCase.execute(testUser.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.username).toBe(testUser.username);

      // Verify relations are loaded
      expect(result.roles).toBeDefined();
      expect(Array.isArray(result.roles)).toBe(true);
      expect(result.permissions).toBeDefined();
      expect(Array.isArray(result.permissions)).toBe(true);
      expect(result.tenants).toBeDefined();
      expect(Array.isArray(result.tenants)).toBe(true);
    });

    it('should throw NotFoundException when user does not exist', async() =>
    {
      // Arrange
      const nonExistentId = faker.number.int({
        min: 10000,
        max: 20000
      })

      // Act & Assert
      await expect(getUserUseCase.execute(nonExistentId))
        .rejects.toThrow(NotFoundException);
    });

    it('should include user roles, permissions and tenants in the response', async() =>
    {
      // Act
      const result = await getUserUseCase.execute(testUser.id);

      // Assert
      // Check roles are assigned
      expect(result.roles).toBeDefined();
      expect(Array.isArray(result.roles)).toBe(true);
      expect(result.roles?.length).toBeGreaterThan(0);

      if (result.roles && result.roles.length > 0)
      {
        expect(result.roles[0].name).toBeDefined();
      }

      expect(result.permissions).toBeDefined();
      expect(Array.isArray(result.permissions)).toBe(true);

      expect(result.tenants).toBeDefined();
      expect(Array.isArray(result.tenants)).toBe(true);
      expect(result.tenants?.length).toBeGreaterThan(0);

      if (result.tenants && result.tenants.length > 0)
      {
        expect(result.tenants[0].name).toBeDefined();
        expect(result.tenants[0].slug).toBeDefined();
      }
    });

    it('should return the same data as direct repository call', async() =>
    {
      const useCaseResult = await getUserUseCase.execute(testUser.id);

      const repoResult = await userRepository.findUserWithRelations(testUser.id);

      expect(useCaseResult.id).toBe(repoResult.id);
      expect(useCaseResult.username).toBe(repoResult.username);

      expect(useCaseResult.roles?.length).toBe(repoResult.roles?.length);
      expect(useCaseResult.permissions?.length).toBe(repoResult.permissions?.length);
      expect(useCaseResult.tenants?.length).toBe(repoResult.tenants?.length);
    });
  });
});

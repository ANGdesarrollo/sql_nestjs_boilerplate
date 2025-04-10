import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { LoginUserUseCase } from '../../src/Auth/Application/LoginUserUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { HashService } from '../../src/Auth/Domain/Services/HashService';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';

import { CreateSuperUserFixture, SuperUserFixture } from './Fixtures/CreateSuperUserFixture';

describe('LoginUserUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let loginUserUseCase: LoginUserUseCase;
  let userRepository: UserRepository;
  let hashService: HashService;
  let syncRolesUseCase: SyncRolesUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let testUser: SuperUserFixture;

  beforeAll(async() =>
  {
    const testEnv =  await global.getTestEnv();
    app = testEnv.app;

    loginUserUseCase = app.get(LoginUserUseCase);
    userRepository = app.get(UserRepository);
    hashService = app.get(HashService);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);

    await syncRolesUseCase.execute();
  });

  beforeEach(async() =>
  {
    testUser = CreateSuperUserFixture();
    await createSuperUserUseCase.execute(testUser);
  });

  describe('execute', () =>
  {
    it('should return a JWT token when login is successful', async() =>
    {
      const token = await loginUserUseCase.execute({
        username: testUser.username,
        password: testUser.password
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should throw UnauthorizedException when user is not found', async() =>
    {
      await expect(loginUserUseCase.execute({
        username: faker.internet.email(),
        password: faker.internet.password()
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async() =>
    {
      const password = faker.internet.password();
      await expect(loginUserUseCase.execute({
        username: testUser.username,
        password
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user has no default tenant', async() =>
    {
      const password = faker.internet.password();
      const hashedPassword = await hashService.hash(password);
      const userWithoutTenant = await userRepository.create({
        username: faker.internet.username(),
        password: hashedPassword
      });

      await expect(loginUserUseCase.execute({
        username: userWithoutTenant.username,
        password
      })).rejects.toThrow(UnauthorizedException);
    });
  });
});

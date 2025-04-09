import { UnauthorizedException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { LoginUserUseCase } from '../../src/Auth/Application/LoginUserUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { HashService } from '../../src/Auth/Domain/Services/HashService';
import { TenantRepository } from '../../src/Auth/Infrastructure/repositories/TenantRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/repositories/UserRepository';
import { UserTenantRepository } from '../../src/Auth/Infrastructure/repositories/UserTenantRepository';
import { clearDatabase } from '../ClearDatabase';
import { getTestAgent } from '../TestAgent';

import { CreateSuperUserFixture } from './Fixtures/CreateSuperUserFixture';


describe('LoginUserUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let loginUserUseCase: LoginUserUseCase;
  let userRepository: UserRepository;
  let hashService: HashService;
  let syncRolesUseCase: SyncRolesUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let dataSource: DataSource;

  const testUser = CreateSuperUserFixture();

  beforeAll(async() =>
  {
    app = await getTestAgent();

    loginUserUseCase = app.get(LoginUserUseCase);
    userRepository = app.get(UserRepository);
    hashService = app.get(HashService);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);
    dataSource = app.get<DataSource>('DATA_SOURCE');

    await syncRolesUseCase.execute();

    await createSuperUserUseCase.execute(testUser);
  });

  afterAll(async() =>
  {
    await clearDatabase(dataSource);
    await app.close();
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
        username: 'nonexistent_user',
        password: 'anypassword'
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async() =>
    {
      await expect(loginUserUseCase.execute({
        username: testUser.username,
        password: 'wrong_password'
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user has no default tenant', async() =>
    {
      const hashedPassword = await hashService.hash('Password456!');
      const userWithoutTenant = await userRepository.create({
        username: `user_without_tenant_${Date.now()}`,
        password: hashedPassword
      });

      await expect(loginUserUseCase.execute({
        username: userWithoutTenant.username,
        password: 'Password456!'
      })).rejects.toThrow(UnauthorizedException);
    });
  });
});

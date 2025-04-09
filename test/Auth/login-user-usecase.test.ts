import { UnauthorizedException } from '@nestjs/common';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { LoginUserUseCase } from '../../src/Auth/Application/LoginUserUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { HashService } from '../../src/Auth/Domain/Services/HashService';
import { UserRepository } from '../../src/Auth/Infrastructure/repositories/UserRepository';

import { CreateSuperUserFixture } from './Fixtures/CreateSuperUserFixture';

describe('LoginUserUseCase - Integration Test', () =>
{
  let loginUserUseCase: LoginUserUseCase;
  let userRepository: UserRepository;
  let hashService: HashService;
  let syncRolesUseCase: SyncRolesUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;

  const testUser = CreateSuperUserFixture();

  beforeAll(async() =>
  {
    const { app } = await global.getTestEnv();

    loginUserUseCase = app.get(LoginUserUseCase);
    userRepository = app.get(UserRepository);
    hashService = app.get(HashService);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);

    await syncRolesUseCase.execute();
    await createSuperUserUseCase.execute(testUser);

    const user = await userRepository.findOneBy(
      'username',
      testUser.username,
      ['tenants', 'roles', 'permissions']
    );
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

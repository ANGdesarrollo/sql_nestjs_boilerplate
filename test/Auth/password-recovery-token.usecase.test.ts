import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { addHours } from 'date-fns';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { AppModule } from '../../src/App/AppModule';
import { PasswordRecoveryTokenDomain } from '../../src/Auth/Domain/Entities/PasswordRecoveryTokenDomain';
import { PasswordRecoveryTokenRepository } from '../../src/Auth/Infrastructure/Repositories/PasswordRecoveryTokenRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';

import { CreateUserFixture } from './Fixtures/CreateUserFixture';
import { getTestAgent } from './TestAgent';

describe('PasswordRecoveryTokenRepository - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let dataSource: DataSource;
  let passwordRecoveryTokenRepository: PasswordRecoveryTokenRepository;
  let userRepository: UserRepository;
  let testUser;
  let testToken: PasswordRecoveryTokenDomain;

  beforeAll(async() =>
  {
    const testEnv = await getTestAgent('password_recovery_token_repository');
    app = testEnv.app;
    dataSource = testEnv.dataSource;

    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    passwordRecoveryTokenRepository = testingModule.get(PasswordRecoveryTokenRepository);
    userRepository = testingModule.get(UserRepository);
  });

  beforeEach(async() =>
  {
    // Create a test user
    testUser = CreateUserFixture({
      tenantIds: [faker.string.uuid()],
      defaultTenantId: faker.string.uuid()
    });
    const createdUser = await userRepository.create({
      username: testUser.username,
      password: testUser.password,
      tenantIds: testUser.tenantIds,
      defaultTenantId: testUser.defaultTenantId
    });

    // Create a test password recovery token
    testToken = {
      id: uuidv4(),
      token: uuidv4(),
      userId: createdUser.id,
      expiresAt: addHours(new Date(), 24),
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await passwordRecoveryTokenRepository.create(testToken);
  });

  afterAll(async() =>
  {
    await app.close();
  });

  describe('findByToken', () =>
  {
    it('should return a token when it exists', async() =>
    {
      const result = await passwordRecoveryTokenRepository.findByToken(testToken.token);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.token).toBe(testToken.token);
      expect(result!.userId).toBe(testToken.userId);
      expect(result!.isUsed).toBe(false);
      expect(result!.expiresAt).toEqual(testToken.expiresAt);
      expect(result!.id).toBeDefined();
      expect(result!.createdAt).toBeDefined();
      expect(result!.updatedAt).toBeDefined();
    });

    it('should return null when token does not exist', async() =>
    {
      const result = await passwordRecoveryTokenRepository.findByToken(faker.string.uuid());

      expect(result).toBeNull();
    });
  });

  describe('markAsUsed', () =>
  {
    it('should mark a token as used', async() =>
    {
      const createdToken = await passwordRecoveryTokenRepository.create({
        ...testToken,
        id: uuidv4(),
        token: uuidv4()
      });

      await passwordRecoveryTokenRepository.markAsUsed(createdToken.id);

      const updatedToken = await passwordRecoveryTokenRepository.findByToken(createdToken.token);
      expect(updatedToken).toBeDefined();
      expect(updatedToken).not.toBeNull();
      expect(updatedToken!.isUsed).toBe(true);
    });
  });

  describe('invalidateUserTokens', () =>
  {
    it('should mark all user tokens as used', async() =>
    {
      // Create multiple tokens for the same user
      const token1 = await passwordRecoveryTokenRepository.create({
        ...testToken,
        id: uuidv4(),
        token: uuidv4()
      });
      const token2 = await passwordRecoveryTokenRepository.create({
        ...testToken,
        id: uuidv4(),
        token: uuidv4()
      });

      await passwordRecoveryTokenRepository.invalidateUserTokens(testToken.userId);

      const updatedToken1 = await passwordRecoveryTokenRepository.findByToken(token1.token);
      const updatedToken2 = await passwordRecoveryTokenRepository.findByToken(token2.token);

      expect(updatedToken1).toBeDefined();
      expect(updatedToken1).not.toBeNull();
      expect(updatedToken1!.isUsed).toBe(true);

      expect(updatedToken2).toBeDefined();
      expect(updatedToken2).not.toBeNull();
      expect(updatedToken2!.isUsed).toBe(true);
    });
  });
});

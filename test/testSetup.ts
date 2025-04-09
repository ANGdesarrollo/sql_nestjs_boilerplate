// TypeScript test setup with imports
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';

import { clearDatabase } from './ClearDatabase';
import { getTestAgent } from './TestAgent';

// Define global types
declare global {
  // eslint-disable-next-line no-var
  var getTestEnv: () => Promise<{
    app: NestFastifyApplication;
    dataSource: DataSource;
  }>;
}

// Global app and dataSource variables
let app: NestFastifyApplication;
let dataSource: DataSource;

// Extend test timeout
jest.setTimeout(30000);

// Custom matchers
expect.extend({
  toBeUuid(received: string)
  {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid UUID`
          : `Expected ${received} to be a valid UUID`
    };
  }
});

// Setup before all tests
beforeAll(async() =>
{
  console.log('🚀 Setting up test environment');
  const testEnv = await getTestAgent();
  app = testEnv.app;
  dataSource = testEnv.database;
  console.log('✅ Test environment initialized');
});

afterEach(async() =>
{
  console.log('🧹 Clearing database');
  if (dataSource)
  {
    await clearDatabase(dataSource);
  }
});

// Make this available globally
global.getTestEnv = async() =>
{
  return { app, dataSource };
};

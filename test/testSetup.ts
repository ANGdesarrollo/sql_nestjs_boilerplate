// Update testSetup.ts
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';

import { clearDatabase } from './ClearDatabase';
import { getTestAgent } from './TestAgent';

declare global {
  var getTestEnv: (suiteName?: string) => Promise<{
    app: NestFastifyApplication;
    dataSource: DataSource;
    schemaName: string;
  }>;
}

let app: NestFastifyApplication;
let dataSource: DataSource;
let schemaName: string;

jest.setTimeout(30000);

// Your custom matchers...

// Setup function to get current test file name
function getCurrentTestFile()
{
  const testPath = expect.getState().testPath;
  if (testPath)
  {
    const parts = testPath.split('/');
    return parts[parts.length - 1].replace('.test.ts', '');
  }
  return undefined;
}

beforeAll(async() =>
{
  console.log('🚀 Setting up test environment');
  const currentTest = getCurrentTestFile();
  const testEnv = await getTestAgent(currentTest);
  app = testEnv.app;
  dataSource = testEnv.dataSource;
  schemaName = testEnv.schemaName;
  console.log(`✅ Test environment initialized with schema: ${schemaName}`);
});

// Drop schema after tests complete
afterAll(async() =>
{
  console.log(`🧹 Dropping schema: ${schemaName}`);
  if (dataSource && dataSource.isInitialized)
  {
    // Drop the schema when we're done
    await dataSource.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    await dataSource.destroy();
  }
  if (app)
  {
    await app.close();
  }
});

// Clear tables between tests
afterEach(async() =>
{
  console.log('🧹 Clearing tables');
  if (dataSource && dataSource.isInitialized)
  {
    await clearDatabase(dataSource);
  }
});

// Updated global getter
global.getTestEnv = async(suiteName?: string) =>
{
  if (!app || !dataSource)
  {
    const testName = suiteName || getCurrentTestFile();
    const testEnv = await getTestAgent(testName);
    app = testEnv.app;
    dataSource = testEnv.dataSource;
    schemaName = testEnv.schemaName;
  }
  return { app, dataSource, schemaName };
};

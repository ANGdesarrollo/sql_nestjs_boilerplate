import { testConfig } from '../TestConfig';

export class MockEnv
{
  get(key: string)
  {
    return testConfig[key] || null;
  }

  get database()
  {
    return testConfig.database;
  }

  get jwt()
  {
    return testConfig.jwt;
  }

  get cookie()
  {
    return testConfig.cookie;
  }

  get isProduction()
  {
    return testConfig.isProduction;
  }

  get isDevelopment()
  {
    return testConfig.isDevelopment;
  }

  get isTest()
  {
    return testConfig.isTest;
  }

  get nodeEnv()
  {
    return testConfig.nodeEnv;
  }
}

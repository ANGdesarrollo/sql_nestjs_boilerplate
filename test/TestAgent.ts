// Modified version of your TestAgent.ts
import fastifyCookie from '@fastify/cookie';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install uuid

import { AppModule } from '../src/App/AppModule';
import { EnvService } from '../src/Config/Env/EnvService';

export const getTestAgent = async(suiteName?: string) =>
{
  // Generate a unique schema name for this test suite
  const schemaName = `test_${(suiteName || uuidv4()).replace(/[^a-zA-Z0-9_]/g, '_')}`;

  // Override DATABASE_SCHEMA in process.env
  process.env.DATABASE_SCHEMA = schemaName;

  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  const app = testingModule.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter()
  );

  app.setGlobalPrefix('api');

  const envService = app.get(EnvService);

  await app.register(fastifyCookie, {
    secret: envService.cookie.secret,
    hook: 'onRequest'
  });

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const dataSource: DataSource = app.get<DataSource>('DATA_SOURCE');

  await dataSource.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

  return {
    app,
    dataSource,
    schemaName
  };
};

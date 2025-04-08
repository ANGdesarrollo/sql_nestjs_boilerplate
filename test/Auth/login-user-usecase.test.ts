import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { getTestAgent } from '../TestAgent';

let app: NestFastifyApplication;

beforeAll(async() =>
{
  app = await getTestAgent();
});

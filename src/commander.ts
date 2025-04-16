import { NestFactory } from '@nestjs/core';
import { CommandFactory } from 'nest-commander';

import { AppModule } from './App/AppModule';
import { Logger } from './Shared/Presentation/Utils/Logger';

void (async() =>
{
  try
  {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn']
    });

    await CommandFactory.run(AppModule);

    await app.close();
  }
  catch (error)
  {
    Logger.error('Failed to run command:', error.message);
    process.exit(1);
  }
})();

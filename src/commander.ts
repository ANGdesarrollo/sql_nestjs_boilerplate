// import { NestFactory } from '@nestjs/core';
// import { CommandFactory } from 'nest-commander';
//
// import { AppModule } from './App/AppModule';
//
// async function bootstrap()
// {
//   await NestFactory.createApplicationContext(AppModule, {
//     logger: ['error', 'warn']
//   }).then(async(appContext) =>
//   {
//     try
//     {
//       await CommandFactory.run(appContext);
//     }
//     finally
//     {
//       await appContext.close();
//     }
//   });
// }
//
// bootstrap();

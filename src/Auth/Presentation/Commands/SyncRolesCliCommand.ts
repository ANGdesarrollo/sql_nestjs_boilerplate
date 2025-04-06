// // src/Auth/Presentation/Commands/SyncRolesCliCommand.ts
// import { Command, CommandRunner } from 'nest-commander';
// import { SyncRolesCommand } from '../../Application/Commands/SyncRolesCommand';
//
// @Command({ name: 'sync:roles', description: 'Synchronize roles and permissions in the database' })
// export class SyncRolesCliCommand extends CommandRunner {
//   constructor(private readonly syncRolesCommand: SyncRolesCommand) {
//     super();
//   }
//
//   async run(): Promise<void> {
//     try {
//       await this.syncRolesCommand.execute();
//       console.log('Roles and permissions have been synchronized successfully');
//       process.exit(0);
//     } catch (error) {
//       console.error('Error while synchronizing roles and permissions:', error.message);
//       process.exit(1);
//     }
//   }
// }
//
// // src/cli.ts
// import { NestFactory } from '@nestjs/core';
// import { CommandModule } from 'nest-commander';
// import { AppModule } from './App/AppModule';
//
// async function bootstrap() {
//   await NestFactory.createApplicationContext(AppModule, {
//     logger: ['error', 'warn'],
//   }).then(async (appContext) => {
//     try {
//       await CommandModule.run(appContext);
//     } finally {
//       await appContext.close();
//     }
//   });
// }
//
// bootstrap();

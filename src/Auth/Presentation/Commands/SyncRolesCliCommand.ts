import { Command, CommandRunner } from 'nest-commander';

import { SyncRolesUseCase } from '../../Application/SyncRolesUseCase';

@Command({ name: 'sync:roles', description: 'Synchronize roles and permissions in the database' })
export class SyncRolesCliCommand extends CommandRunner
{
  constructor(private readonly syncRolesUseCase: SyncRolesUseCase)
  {
    super();
  }

  async run(): Promise<void>
  {
    try
    {
      await this.syncRolesUseCase.execute();
      console.log('Roles and permissions have been synchronized successfully');
      process.exit(0);
    }
    catch (error)
    {
      console.error('Error while synchronizing roles and permissions:', error.message);
      process.exit(1);
    }
  }
}

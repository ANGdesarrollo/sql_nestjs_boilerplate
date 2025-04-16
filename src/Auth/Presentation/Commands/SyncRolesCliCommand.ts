import { Command, CommandRunner } from 'nest-commander';

import { Logger } from '../../../Shared/Presentation/Utils/Logger';
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
      Logger.log('Roles and permissions have been synchronized successfully');
      process.exit(0);
    }
    catch (error)
    {
      Logger.error('Failed to synchronize roles and permissions', error);
      process.exit(1);
    }
  }
}

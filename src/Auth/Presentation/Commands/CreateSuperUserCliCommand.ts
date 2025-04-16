import { Command, CommandRunner, Option } from 'nest-commander';

import { Logger } from '../../../Shared/Presentation/Utils/Logger';
import { CreateSuperUserUseCase } from '../../Application/CreateSuperUserUseCase';

interface CreateSuperUserCommandOptions {
  username?: string;
  password?: string;
  tenantName?: string;
  tenantSlug?: string;
}

@Command({ name: 'create:superuser', description: 'Create a super user with full permissions' })
export class CreateSuperUserCliCommand extends CommandRunner
{
  constructor(private readonly createSuperUserUseCase: CreateSuperUserUseCase)
  {
    super();
  }

  async run(
    passedParams: string[],
    options?: CreateSuperUserCommandOptions
  ): Promise<void>
  {
    try
    {
      await this.createSuperUserUseCase.execute({
        username: options?.username,
        password: options?.password,
        tenantName: options?.tenantName,
        tenantSlug: options?.tenantSlug
      });
      process.exit(0);
    }
    catch (error)
    {
      Logger.error('Error while creating super user:', error.message);
      process.exit(1);
    }
  }

  @Option({
    flags: '-u, --username [username]',
    description: 'Username for the super user (default: superadmin)'
  })
  parseUsername(value: string): string
  {
    return value;
  }

  @Option({
    flags: '-p, --password [password]',
    description: 'Password for the super user (default: randomly generated)'
  })
  parsePassword(value: string): string
  {
    return value;
  }

  @Option({
    flags: '-t, --tenant-name [tenantName]',
    description: 'Name for the system tenant (default: System)'
  })
  parseTenantName(value: string): string
  {
    return value;
  }

  @Option({
    flags: '-s, --tenant-slug [tenantSlug]',
    description: 'Slug for the system tenant (default: system)'
  })
  parseTenantSlug(value: string): string
  {
    return value;
  }
}

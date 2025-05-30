import { Injectable, ConflictException } from '@nestjs/common';

import { slugify } from '../../Shared/Presentation/Utils/Slugify';
import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { CreateTenantPayload } from '../Domain/Payloads/CreateTenantPayload';
import { TenantPayload } from '../Domain/Payloads/TenantPayload';
import { TenantRepository } from '../Infrastructure/Repositories/TenantRepository';
import { TenantValidator } from '../Presentation/Validations/TenantValidator';

@Injectable()
export class CreateTenantUseCase extends Validator<CreateTenantPayload>
{
  constructor(private readonly tenantRepository: TenantRepository)
  {
    super(TenantValidator.omit({ id: true }));
  }

  async execute(payload: CreateTenantPayload): Promise<void>
  {
    const data = this.validate(payload);

    const tenant: TenantPayload = {
      ...data,
      slug: slugify(data.name)
    };

    const existingTenantByName = await this.tenantRepository.findOneBy({ name: tenant.name });
    if (existingTenantByName)
    {
      throw new ConflictException(`Tenant with name '${data.name}' already exists`);
    }

    await this.tenantRepository.create(tenant);
  }
}

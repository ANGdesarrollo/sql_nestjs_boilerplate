import { Injectable, ConflictException } from '@nestjs/common';

import { slugify } from '../../Shared/Presentation/Utils/Slugify';
import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { CreateTenantPayload } from '../Domain/Payloads/CreateTenantPayload';
import { TenantPayload } from '../Domain/Payloads/TenantPayload';
import { TenantRepository } from '../Infrastructure/Repositories/TenantRepository';
import { TenantPayloadSchema } from '../Presentation/Validations/TenantSchema';

@Injectable()
export class CreateTenantUseCase extends Validator<CreateTenantPayload>
{
  constructor(private readonly tenantRepository: TenantRepository)
  {
    super(TenantPayloadSchema.omit({ id: true }));
  }

  async execute(payload: CreateTenantPayload): Promise<void>
  {
    const data = this.validate(payload);

    const tenant: TenantPayload = {
      ...data,
      slug: slugify(data.name)
    };

    const existingTenantByName = await this.tenantRepository.findOneBy('name', tenant.name);
    if (existingTenantByName)
    {
      throw new ConflictException(`Tenant with name '${data.name}' already exists`);
    }

    const existingTenantBySlug = await this.tenantRepository.findBySlug(tenant.slug);
    if (existingTenantBySlug)
    {
      throw new ConflictException(`Tenant with slug '${tenant.slug}' already exists`);
    }

    await this.tenantRepository.create(tenant);
  }
}

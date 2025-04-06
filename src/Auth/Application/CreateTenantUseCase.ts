import { Injectable, ConflictException } from '@nestjs/common';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { TenantPayload } from '../Domain/Payloads/TenantPayload';
import { TenantRepository } from '../Infrastructure/repositories/TenantRepository';
import { TenantPayloadSchema } from '../Presentation/Validations/TenantSchema';

@Injectable()
export class CreateTenantUseCase extends Validator<TenantPayload>
{
  constructor(
    private readonly tenantRepository: TenantRepository
  )
  {
    super(TenantPayloadSchema);
  }

  async execute(payload: TenantPayload): Promise<void>
  {
    const data = this.validate(payload);

    const existingTenantByName = await this.tenantRepository.findOneBy('name', data.name);
    if (existingTenantByName)
    {
      throw new ConflictException(`Tenant with name '${data.name}' already exists`);
    }

    const existingTenantBySlug = await this.tenantRepository.findBySlug(data.slug);
    if (existingTenantBySlug)
    {
      throw new ConflictException(`Tenant with slug '${data.slug}' already exists`);
    }

    await this.tenantRepository.create(data);
  }
}

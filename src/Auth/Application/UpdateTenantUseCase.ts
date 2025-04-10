import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { TenantDomain } from '../Domain/Entities/TenantDomain';
import { TenantPayload } from '../Domain/Payloads/TenantPayload';
import { TenantRepository } from '../Infrastructure/Repositories/TenantRepository';
import { TenantPayloadSchema } from '../Presentation/Validations/TenantSchema';

interface UpdateTenantParams {
  id: string;
  data: Partial<TenantPayload>;
}

@Injectable()
export class UpdateTenantUseCase extends Validator<Partial<TenantPayload>>
{
  constructor(
    private readonly tenantRepository: TenantRepository
  )
  {
    super(TenantPayloadSchema.partial());
  }

  async execute(params: UpdateTenantParams): Promise<TenantDomain>
  {
    const { id, data } = params;
    const validatedData = this.validate(data);

    const tenant = await this.tenantRepository.findOneBy('id', id);
    if (!tenant)
    {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    if (validatedData.name && validatedData.name !== tenant.name)
    {
      const existingTenantByName = await this.tenantRepository.findOneBy('name', validatedData.name);
      if (existingTenantByName && existingTenantByName.id !== id)
      {
        throw new ConflictException(`Tenant with name '${validatedData.name}' already exists`);
      }
    }

    if (validatedData.slug && validatedData.slug !== tenant.slug)
    {
      const existingTenantBySlug = await this.tenantRepository.findBySlug(validatedData.slug);
      if (existingTenantBySlug && existingTenantBySlug.id !== id)
      {
        throw new ConflictException(`Tenant with slug '${validatedData.slug}' already exists`);
      }
    }

    return this.tenantRepository.update(id, validatedData);
  }
}

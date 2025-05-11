import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { slugify } from '../../Shared/Presentation/Utils/Slugify';
import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { TenantDomain } from '../Domain/Entities/TenantDomain';
import { TenantPayload } from '../Domain/Payloads/TenantPayload';
import { UpdateTenantPayload } from '../Domain/Payloads/UpdateTenantPayload';
import { TenantRepository } from '../Infrastructure/Repositories/TenantRepository';
import { TenantPayloadSchema } from '../Presentation/Validations/TenantSchema';

@Injectable()
export class UpdateTenantUseCase extends Validator<UpdateTenantPayload>
{
  constructor(private readonly tenantRepository: TenantRepository)
  {
    super(TenantPayloadSchema);
  }

  async execute(payload: UpdateTenantPayload): Promise<TenantDomain>
  {
    const data = this.validate(payload);

    const id = data.id;

    const tenant = await this.tenantRepository.findOneBy({id});
    if (!tenant)
    {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    if (data.name && data.name !== tenant.name)
    {
      const existingTenantByName = await this.tenantRepository.findOneBy({ name: data.name });
      if (existingTenantByName && existingTenantByName.id !== id)
      {
        throw new ConflictException(`Tenant with name '${data.name}' already exists`);
      }
    }
    const dataTenantToUpdate: TenantPayload  = {
      ...data,
      slug: slugify(data.name)
    };
    return this.tenantRepository.update(id, dataTenantToUpdate);
  }
}

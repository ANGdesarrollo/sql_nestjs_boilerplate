import { Injectable } from '@nestjs/common';

import { CriteriaResponse } from '../../Shared/Domain/Criteria/CriteriaResponse';
import { TenantDomain } from '../Domain/Entities/TenantDomain';
import { TenantRepository } from '../Infrastructure/Repositories/TenantRepository';
import { TenantCriteria } from '../Presentation/Criteria/TenantCriteria';

@Injectable()
export class ListTenantsUseCase
{
  constructor(private readonly repository: TenantRepository) {}

  async execute(criteria: TenantCriteria): Promise<CriteriaResponse<TenantDomain>>
  {
    return this.repository.listByCriteria(criteria);
  }
}

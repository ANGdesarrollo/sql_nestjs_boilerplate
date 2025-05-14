import { BaseCriteria } from '../../../Shared/Domain/Criteria/BaseCriteria';

export class TenantCriteria extends BaseCriteria
{
  static validSortFields: string[] = ['createdAt', 'name', 'slug'];
  static validFilterKeys: string[] = ['name', 'slug'];

  validate()
  {
    this.validateSortAndOrder();
    this.validateAndNormalizeFilters();
  }
}

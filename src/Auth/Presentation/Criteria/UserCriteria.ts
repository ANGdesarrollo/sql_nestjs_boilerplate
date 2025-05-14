import { BaseCriteria } from '../../../Shared/Domain/Criteria/BaseCriteria';

export class UserCriteria extends BaseCriteria
{
  static validSortFields: string[] = ['createdAt', 'username'];
  static validFilterKeys: string[] = ['username'];

  validate()
  {
    this.validateSortAndOrder();
    this.validateAndNormalizeFilters();
  }
}

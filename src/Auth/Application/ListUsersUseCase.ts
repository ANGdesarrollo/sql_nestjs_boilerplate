import { Injectable } from '@nestjs/common';

import { CriteriaResponse } from '../../Shared/Domain/Criteria/CriteriaResponse';
import { UserDomain } from '../Domain/Entities/UserDomain';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';
import { UserCriteria } from '../Presentation/Criteria/UserCriteria';

@Injectable()
export class ListUsersUseCase
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(criteria: UserCriteria): Promise<CriteriaResponse<UserDomain>>
  {
    return this.userRepository.listByCriteria(criteria,  [
      'roles',
      'permissions',
      'tenants'
    ]);
  }
}

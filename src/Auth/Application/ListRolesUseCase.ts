import { Injectable } from '@nestjs/common';

import { RoleDomain } from '../Domain/Entities/RoleDomain';
import { RoleRepository } from '../Infrastructure/Repositories/RoleRepository';

@Injectable()
export class ListRolesUseCase
{
  constructor(
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(): Promise<RoleDomain[]>
  {
    return await this.roleRepository.list(['permissions']);
  }
}

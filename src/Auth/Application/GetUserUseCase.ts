import { Injectable } from '@nestjs/common';

import { UserDomain } from '../Domain/Entities/UserDomain';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';

@Injectable()
export class GetUserUseCase
{
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async execute(userId: number): Promise<UserDomain>
  {
    return this.userRepository.findUserWithRelations(userId);
  }
}

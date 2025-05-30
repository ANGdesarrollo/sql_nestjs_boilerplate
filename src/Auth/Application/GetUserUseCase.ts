import { Injectable  } from '@nestjs/common';

import { BaseId } from '../../Shared/Domain/Entities/BaseId';
import { IdValidator } from '../../Shared/Presentation/Validations/IdValidator';
import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { UserDomain } from '../Domain/Entities/UserDomain';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';


@Injectable()
export class GetUserUseCase extends Validator<BaseId>
{
  constructor(
    private readonly userRepository: UserRepository
  )
  {
    super(IdValidator);
  }

  async execute(id: number): Promise<UserDomain>
  {
    const { id: validatedUserId } = this.validate({ id });
    return this.userRepository.findUserWithRelations(validatedUserId);
  }
}

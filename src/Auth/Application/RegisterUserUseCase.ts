import { Injectable } from '@nestjs/common';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { RegisterUserPayload } from '../Domain/Payloads/RegisterUserPayload';
import { UserRepository } from '../Infrastructure/repositories/UserRepository';
import { RegisterUserPayloadSchema } from '../Presentation/Validations/RegisterUserSchema';
import { UserDomain } from '../Domain/Entities/UserDomain';

@Injectable()
export class RegisterUserUseCase extends Validator<RegisterUserPayload>
{
  constructor(private readonly userRepository: UserRepository
  )
  {
    super(RegisterUserPayloadSchema);
  }

  async execute(payload: RegisterUserPayload): Promise<UserDomain>
  {
    const data = this.validate(payload);

    return this.userRepository.create(data);
  }
}

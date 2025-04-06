import { Injectable } from '@nestjs/common';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { UserDomain } from '../Domain/Entities/UserDomain';
import { RegisterUserPayload } from '../Domain/Payloads/RegisterUserPayload';
import { HashService } from '../Domain/Services/HashService';
import { UserRepository } from '../Infrastructure/repositories/UserRepository';
import { RegisterUserPayloadSchema } from '../Presentation/Validations/RegisterUserSchema';

@Injectable()
export class CreateUserUseCase extends Validator<RegisterUserPayload>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService
  )
  {
    super(RegisterUserPayloadSchema);
  }

  async execute(payload: RegisterUserPayload): Promise<UserDomain>
  {
    const data = this.validate(payload);

    data.password = await this.hashService.hash(data.password);

    const newUser = await this.userRepository.create(data);

    return newUser;
  }
}

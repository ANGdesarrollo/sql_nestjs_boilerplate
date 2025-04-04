import { Injectable } from '@nestjs/common';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { RegisterUserPayload } from '../Domain/Payloads/RegisterUserPayload';
import { UserRepository } from '../Infrastructure/repositories/UserRepository';
import { RegisterUserPayloadSchema } from '../Presentation/Validations/RegisterUserSchema';

@Injectable()
export class RegisterUserUseCase extends Validator<RegisterUserPayload>
{
  constructor(private readonly userRepository: UserRepository
  )
  {
    super(RegisterUserPayloadSchema);
  }

  async execute(payload: RegisterUserPayload): Promise<RegisterUserPayload>
  {
    const data = this.validate(payload);

    const user = await this.userRepository.create(data);

    console.log(user);

    return data;
  }
}

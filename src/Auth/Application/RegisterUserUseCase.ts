import { Injectable } from '@nestjs/common';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { RegisterUserPayload } from '../Domain/Payloads/RegisterUserPayload';
import { RegisterUserPayloadSchema } from '../Presentation/Validations/RegisterUserSchema';

@Injectable()
export class RegisterUserUseCase extends Validator<RegisterUserPayload>
{
  constructor()
  {
    super(RegisterUserPayloadSchema);
  }

  async execute(payload: RegisterUserPayload): Promise<RegisterUserPayload>
  {
    const data = this.validate(payload);

    return data;
  }
}

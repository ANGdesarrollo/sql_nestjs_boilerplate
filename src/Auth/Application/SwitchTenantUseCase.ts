import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { JwtPayload } from '../Domain/Payloads/JwtPayload';
import { SwitchTenantPayload } from '../Domain/Payloads/SwitchTenantPayload';
import { UserTenantRepository } from '../Infrastructure/repositories/UserTenantRepository';
import { SwitchValidatorSchema } from '../Presentation/Validations/SwitchTenantValidator';

@Injectable()
export class SwitchTenantUseCase extends Validator<SwitchTenantPayload>
{
  constructor(
    private readonly userTenantRepository: UserTenantRepository,
    private readonly jwtService: JwtService
  )
  {
    super(SwitchValidatorSchema);
  }

  async execute(payload: SwitchTenantPayload): Promise<string>
  {
    const { userId, tenantId } =  this.validate(payload);

    const userTenant = await this.userTenantRepository.findByUserAndTenant(userId, tenantId);
    if (!userTenant)
    {
      throw new ForbiddenException('User does not have access to the requested tenant');
    }

    const jwtObject: JwtPayload = {
      userId,
      tenantId
    };

    return this.jwtService.sign(jwtObject);
  }
}

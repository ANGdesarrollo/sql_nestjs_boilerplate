import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { PasswordRecoveryTokenDomain } from '../../Domain/Entities/PasswordRecoveryTokenDomain';

@Injectable()
export class PasswordRecoveryTokenRepository extends BaseTypeOrmRepositoryImpl<Partial<PasswordRecoveryTokenDomain>, PasswordRecoveryTokenDomain>
{
  constructor(
    @Inject('PASSWORD_RECOVERY_TOKEN_REPOSITORY')
      tokenRepository: Repository<PasswordRecoveryTokenDomain>
  )
  {
    super(tokenRepository, 'PasswordRecoveryTokenEntity');
  }

  async findByToken(token: string): Promise<PasswordRecoveryTokenDomain | null>
  {
    try
    {
      return await this.repository.findOne({
        where: { token },
        relations: ['user']
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'findByToken');
    }
  }

  async markAsUsed(id: number): Promise<void>
  {
    try
    {
      await this.repository.update(id, { isUsed: true });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'markAsUsed');
    }
  }

  async invalidateUserTokens(userId: number): Promise<void>
  {
    try
    {
      await this.repository.update(
        { userId },
        { isUsed: true }
      );
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'invalidateUserTokens');
    }
  }
}

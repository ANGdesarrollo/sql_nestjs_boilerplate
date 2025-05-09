import { BaseId } from '../../../Shared/Domain/Entities/BaseId';
import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';

export interface PasswordRecoveryTokenDomain extends BaseId, BaseTimeStamp {
  token: string;
  userId: string;
  expiresAt: Date;
  isUsed: boolean;
}

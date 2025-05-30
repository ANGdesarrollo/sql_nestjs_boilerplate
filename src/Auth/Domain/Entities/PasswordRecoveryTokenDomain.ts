import { BaseId } from '../../../Shared/Domain/Entities/BaseId';
import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';

export interface PasswordRecoveryTokenDomain extends BaseId, BaseTimeStamp {
  token: string;
  userId: number;
  expiresAt: Date;
  isUsed: boolean;
}

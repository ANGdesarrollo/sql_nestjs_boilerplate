import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';

import { PasswordRecoveryPayload } from '../../../Auth/Domain/Payloads/PasswordRecoveryPayload';
import { EnvService } from '../../../Config/Env/EnvService';
import { NotificationStrategy } from '../NotificationStrategy';

@Injectable()
export class PasswordRecoveryStrategy implements NotificationStrategy<PasswordRecoveryPayload>
{
  constructor(private readonly envService: EnvService) {}

  buildSubject(data: PasswordRecoveryPayload): string
  {
    return 'Password Recovery Request';
  }

  buildBody(data: PasswordRecoveryPayload): string
  {
    const baseUrl = `${this.envService.frontEndUrl}/auth/reset-password`;

    const resetUrl = `${baseUrl}/reset-password?token=${data.recoveryToken}`;
    const expiresAt = format(data.expiresAt, 'MMM dd, yyyy HH:mm');

    return `
      <h2>Password Recovery</h2>
      <p>You have requested to reset your password. Please click the link below to set a new password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire on ${expiresAt}.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
    `;
  }

  getRecipients(data: PasswordRecoveryPayload): string[]
  {
    return [data.userEmail];
  }
}

export interface PasswordRecoveryPayload {
  userEmail: string;
  recoveryToken: string;
  expiresAt: Date;
}

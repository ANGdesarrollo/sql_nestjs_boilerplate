export class PasswordRecoveryEvent
{
  constructor(
    public readonly email: string,
    public readonly token: string,
    public readonly expiresAt: Date
  ) {}
}

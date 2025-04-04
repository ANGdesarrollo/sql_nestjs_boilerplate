import { UserDomain } from '../../Domain/Entities/UserDomain';

export class UserTransformer
{
  private readonly username: string;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(payload: UserDomain)
  {
    this.username = payload.username;
    this.createdAt = payload.createdAt;
    this.updatedAt = payload.updatedAt;
  }
}

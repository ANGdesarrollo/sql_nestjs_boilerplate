import { UserPayload } from './UserPayload';

export type LoginUserPayload = Pick<UserPayload, 'username' | 'password'>;

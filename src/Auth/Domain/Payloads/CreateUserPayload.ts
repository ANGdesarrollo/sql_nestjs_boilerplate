import { UserPayload } from './UserPayload';

export interface CreateUserPayload extends UserPayload {
  tenantIds: number[];
  defaultTenantId: number;
}

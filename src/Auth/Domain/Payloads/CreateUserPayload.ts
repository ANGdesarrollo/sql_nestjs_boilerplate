import { UserPayload } from './UserPayload';

export interface CreateUserPayload extends UserPayload {
  tenantIds: string[];
  defaultTenantId: string;
}

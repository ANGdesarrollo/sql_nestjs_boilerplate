export interface UserPayload {
  username: string;
  password: string;
  tenantIds: string[];
  defaultTenantId: string;
}

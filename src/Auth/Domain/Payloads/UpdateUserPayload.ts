export interface UpdateUserPayload {
  id: string;
  username?: string;
  password?: string;
  tenantChanges?: {
    addTenantIds?: string[];
    removeTenantIds?: string[];
    defaultTenantId?: string;
  };
}

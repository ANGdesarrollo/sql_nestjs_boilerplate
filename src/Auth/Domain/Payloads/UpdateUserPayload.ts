export interface UpdateUserPayload {
  id: number;
  username?: string;
  password?: string;
  tenantChanges?: {
    addTenantIds?: number[];
    removeTenantIds?: number[];
    defaultTenantId?: number;
  };
}

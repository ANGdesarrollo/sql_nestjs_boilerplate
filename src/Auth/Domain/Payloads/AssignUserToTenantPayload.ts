export interface AssignUserToTenantPayload {
  userId: number;
  tenantId: number;
  setAsDefault?: boolean;
}

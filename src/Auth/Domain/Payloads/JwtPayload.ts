export interface JwtPayload {
  username: string;
  userId: string;
  tenantId: string;
  permissions: string[];
}

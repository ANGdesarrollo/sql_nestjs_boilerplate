import { TenantPayload } from './TenantPayload';

export type UpdateTenantPayload = Omit<TenantPayload, 'slug'> & {
  id: string;
};

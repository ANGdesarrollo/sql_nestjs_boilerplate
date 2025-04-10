import { TenantPayload } from './TenantPayload';

export type CreateTenantPayload = Omit<TenantPayload, 'slug'>;

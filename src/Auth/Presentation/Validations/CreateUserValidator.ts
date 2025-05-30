import { z } from 'zod';

export const CreateUserPayloadValidator = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  tenantIds: z.array(z.number({ message: 'Tenant ID must be a valid id' })),
  defaultTenantId: z.number({ message: 'Default tenant ID must be a valid number' })
}).refine(data =>
{
  return data.tenantIds.includes(data.defaultTenantId);
}, {
  message: 'Default tenant must be included in the tenant list',
  path: ['defaultTenantId']
}).refine(data =>
{
  return data.tenantIds.length > 0;
}, {
  message: 'You must provide at least one tenant',
  path: ['tenantIds']
});

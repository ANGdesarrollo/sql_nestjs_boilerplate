import { z } from 'zod';

export const UpdateUserPayloadValidator = z.object({
  id: z.number({ message: 'User ID must be a valid id' }),
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .optional(),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .optional(),
  tenantChanges: z.object({
    addTenantIds: z.array(z.number({ message: 'Tenant ID must be a valid id' }))
      .optional(),
    removeTenantIds: z.array(z.number({ message: 'Tenant ID must be a valid id' }))
      .optional(),
    defaultTenantId: z.number({ message: 'Default tenant ID must be a valid id' })
      .optional()
  }).optional()
}).refine(data =>
{
  return !(!data.username && !data.password && !data.tenantChanges);
}, {
  message: 'At least one field must be provided for update',
  path: []
});

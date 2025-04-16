import { z } from 'zod';

export const UpdateUserPayloadSchema = z.object({
  id: z.string().uuid({ message: 'User ID must be a valid UUID' }),
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .optional(),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .optional(),
  tenantChanges: z.object({
    addTenantIds: z.array(z.string().uuid({ message: 'Tenant ID must be a valid UUID' }))
      .optional(),
    removeTenantIds: z.array(z.string().uuid({ message: 'Tenant ID must be a valid UUID' }))
      .optional(),
    defaultTenantId: z.string().uuid({ message: 'Default tenant ID must be a valid UUID' })
      .optional()
  }).optional()
}).refine(data =>
{
  if (!data.username && !data.password && !data.tenantChanges)
  {
    return false;
  }
  return true;
}, {
  message: 'At least one field must be provided for update',
  path: []
});

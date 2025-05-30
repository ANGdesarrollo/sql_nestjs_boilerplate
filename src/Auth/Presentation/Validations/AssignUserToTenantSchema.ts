import { z } from 'zod';

export const AssignUserToTenantSchema = z.object({
  userId: z.number().positive({ message: 'User ID must be a positive number' }),
  tenantId: z.number().positive({ message: 'Tenant ID must be a positive number' }),
  setAsDefault: z.boolean().optional().default(false)
});

import { z } from 'zod';

export const TenantValidator = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  id: z.number()
});

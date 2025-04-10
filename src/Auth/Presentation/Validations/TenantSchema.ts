import { z } from 'zod';

export const TenantPayloadSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  id: z.string().uuid()
});

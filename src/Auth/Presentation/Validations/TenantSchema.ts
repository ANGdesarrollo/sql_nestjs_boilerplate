import { z } from 'zod';

export const TenantPayloadSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens'
  })
});

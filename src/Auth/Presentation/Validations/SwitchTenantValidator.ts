import { z } from 'zod';

export const SwitchValidatorSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid()
});

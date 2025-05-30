import { z } from 'zod';

export const SwitchValidatorSchema = z.object({
  userId: z.number(),
  tenantId: z.number()
});

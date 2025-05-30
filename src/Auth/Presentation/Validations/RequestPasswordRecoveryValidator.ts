import { z } from 'zod';

export const RequestPasswordRecoveryValidator = z.object({
  email: z.string().email({ message: 'Invalid email format' })
});

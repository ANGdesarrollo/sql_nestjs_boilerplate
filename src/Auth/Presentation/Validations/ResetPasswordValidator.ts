import { z } from 'zod';

export const ResetPasswordValidator = z.object({
  token: z.string().uuid({ message: 'Invalid token format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' })
});

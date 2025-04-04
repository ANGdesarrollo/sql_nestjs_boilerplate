import { z } from 'zod';

export const RegisterUserPayloadSchema = z.object({
  username: z.string(),
  password: z.string()
});

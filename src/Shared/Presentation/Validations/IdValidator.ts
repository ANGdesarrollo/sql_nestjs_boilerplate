import { z } from 'zod';

export const IdValidator = z.object({
  id: z.number().positive({ message: 'ID must be a positive number' })
});

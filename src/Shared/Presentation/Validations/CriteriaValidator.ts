import { z, ZodType } from 'zod';

import { Validator } from './Validator';

export class CriteriaValidationSchema extends Validator<any>
{
  constructor(filtersSchema: ZodType<any>)
  {
    const schema = z.object({
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10)),
      offset: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)),
      filters: filtersSchema.optional().default({})
    });

    super(schema);
  }

  validateCriteria(payload: any): any
  {
    return super.validate(payload);
  }
}

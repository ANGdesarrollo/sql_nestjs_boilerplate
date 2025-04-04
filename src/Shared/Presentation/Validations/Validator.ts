import { z } from 'zod';

export abstract class Validator<T>
{
  protected schema: z.ZodType<T>;
  protected data: T;

  protected constructor(schema: z.ZodType<T>)
  {
    this.schema = schema;
  }

  validate(payload: T): T
  {
    const result = this.schema.safeParse(payload);

    if (!result.success)
    {
      throw new Error(`Validation error: ${JSON.stringify(result.error.format())}`);
    }

    return result.data;
  }
}

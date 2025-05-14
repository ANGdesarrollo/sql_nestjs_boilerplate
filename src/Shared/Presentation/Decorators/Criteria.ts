import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Criteria = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
  {
    const request = ctx.switchToHttp().getRequest();
    const { offset = 0, limit = 10, sortBy = 'createdAt', orderBy = 'desc', ...filters } = request.query;

    const criteriaClass = data as { new (offset: number, limit: number, sortBy: string, orderBy: string): any };
    const criteria = new criteriaClass(offset, limit, sortBy, orderBy);

    const transformedFilters: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(filters))
    {
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']'))
      {
        transformedFilters[key] = value.slice(1, -1).split(',').map((val) => val.trim());
      }
      else
      {
        throw new Error('Invalid filter value');
      }
    }

    criteria.filters = transformedFilters;

    criteria.validate();

    return criteria;
  }
);

import { BadRequestException } from '@nestjs/common';

export abstract class BaseCriteria
{
  offset: number = 0;
  limit: number = 10;
  sortBy: string;
  orderBy: string;
  filters: Record<string, string[]> = {};

  static validSortFields: string[] = ['createdAt', 'updatedAt'];
  static validOrderByValues: string[] = ['asc', 'desc'];
  static validFilterKeys: string[] = [];

  constructor(offset: number = 0, limit: number = 10, sortBy: string = 'createdAt', orderBy: string = 'desc')
  {
    this.offset = offset;
    this.limit = limit;
    this.sortBy = sortBy;
    this.orderBy = orderBy;
  }

  protected validateSortAndOrder()
  {
    const validSortFields = (this.constructor as any).validSortFields; // Accedemos a la clase que instancia 'this'
    if (!validSortFields.includes(this.sortBy))
    {
      throw new BadRequestException(`Invalid sortBy field. Valid fields are: ${validSortFields.join(', ')}`);
    }

    const validOrderByValues = (this.constructor as any).validOrderByValues;
    if (!validOrderByValues.includes(this.orderBy))
    {
      throw new BadRequestException(`Invalid orderBy value. Valid values are: ${validOrderByValues.join(', ')}`);
    }
  }

  protected validateAndNormalizeFilters()
  {
    const validFilterKeys = (this.constructor as any).validFilterKeys; // Accedemos a la clase que instancia 'this'
    for (const key of Object.keys(this.filters))
    {
      if (!validFilterKeys.includes(key))
      {
        throw new BadRequestException(`Invalid filter key: ${key}. Allowed keys are: ${validFilterKeys.join(', ')}`);
      }
    }
  }
}

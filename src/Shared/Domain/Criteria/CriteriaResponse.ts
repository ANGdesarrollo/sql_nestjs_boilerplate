export interface CriteriaResponse<T>
{
  data: T[];
  totalPages: number;
  nextPage: string | null;
  prevPage: string | null;
}

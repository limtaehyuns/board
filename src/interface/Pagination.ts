export interface Pagination {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  data: T[];
}

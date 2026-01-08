export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

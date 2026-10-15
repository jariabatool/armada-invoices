export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListResponse<T> {
  items: T[];
}

export interface FieldError {
  field: string;
  message: string;
}

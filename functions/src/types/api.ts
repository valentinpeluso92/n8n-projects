export interface ApiResponse<T = any> {
  success: boolean;
  httpStatus: number;
  data?: T;
  message?: string;
  errors?: string[];
  details?: string;
  count?: number;
  searchCriteria?: SearchCriteria;
  hasConflicts?: boolean;
}

export interface SearchCriteria {
  name?: string;
  clientId?: string;
  date?: string;
  status?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
  orderBy?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginationMeta {
  limit: number;
  hasMore: boolean;
  totalCount?: number;
  cursor?: string;
  page?: number;
  totalPages?: number;
}

export interface FilterOptions {
  pagination?: PaginationOptions;
  includeDeleted?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// HTTP Method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';

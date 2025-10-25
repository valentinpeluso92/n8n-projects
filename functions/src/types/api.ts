export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
  count?: number;
  searchCriteria?: SearchCriteria;
  hasConflicts?: boolean;
}

// TODO - Separar en un search criteria por entidad
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

// TODO - Separar en un filter options por entidad
export interface FilterOptions {
  name?: string;
  pagination?: PaginationOptions;
  includeDeleted?: boolean;
  clientId?: string;
  date?: string;
  status?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// HTTP Method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';

// Response helpers
export type SuccessResponse<T> = Required<Pick<ApiResponse<T>, 'success' | 'data'>>;
export type ErrorResponse = Required<Pick<ApiResponse, 'success' | 'error'>>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
  count?: number;
  searchCriteria?: SearchCriteria;
}

export interface SearchCriteria {
  name?: string;
  threshold?: number;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface FilterOptions {
  name?: string;
  threshold?: number;
  pagination?: PaginationOptions;
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

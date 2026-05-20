export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export type SortOrder = 'asc' | 'desc';

export interface HomepageCollection {
  id: string;
  section: 'featured_tours' | 'featured_services' | 'featured_blog';
  item_id: string;
  item_type: 'tour' | 'service' | 'blog';
  sort_order: number;
  is_pinned: boolean;
  created_at: string;
}

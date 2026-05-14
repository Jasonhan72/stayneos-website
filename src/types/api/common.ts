/**
 * 通用 API 共享类型
 */

// ── 通用响应结构 ──

/** 通用 API 响应结构 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, string[]>;
}

/** 分页响应结构 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** API 错误结构 */
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

/** HTTP 方法类型 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** 请求配置选项 */
export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

// ── 新通用类型 ──

/** 通用成功响应 */
export interface SuccessResponse {
  success: true;
}

/** 通用分页参数 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** API 错误响应（非 200） */
export interface ApiErrorResponse {
  error: string;
  statusCode?: number;
  details?: Record<string, string[]>;
}

/** 受保护的路由鉴权错误 */
export interface UnauthorizedResponse {
  error: 'Unauthorized';
}

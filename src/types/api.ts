/**
 * API 响应类型定义
 */

// 通用 API 响应结构
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, string[]>;
}

// 分页响应结构
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API 错误结构
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

// HTTP 方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// 请求配置选项
export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

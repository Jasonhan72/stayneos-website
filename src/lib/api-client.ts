/**
 * API Client - 统一处理 HTTP 请求
 * - fetch 封装，统一处理错误
 * - 认证 token 自动附加
 * - 响应统一处理
 */

import { ApiError, RequestConfig, HttpMethod } from '@/types/api';

// API 基础 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 请求超时设置（毫秒）
const DEFAULT_TIMEOUT = 30000;

/**
 * 获取认证 token
 */
function getAuthToken(): string | null {
  // 从 localStorage 获取 token（客户端）
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }
  return null;
}

/**
 * 设置认证 token
 */
export function setAuthToken(token: string, remember = false): void {
  if (typeof window !== 'undefined') {
    if (remember) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
  }
}

/**
 * 清除认证 token
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  }
}

/**
 * 构建完整 URL
 */
function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  // 如果 path 已经是完整 URL，直接使用
  const baseUrl = path.startsWith('http') ? '' : API_BASE_URL;
  let url = `${baseUrl}${path}`;
  
  // 添加查询参数
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `${url.includes('?') ? '&' : '?'}${queryString}`;
    }
  }
  
  return url;
}

/**
 * 创建超时 Promise
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
}

/**
 * 处理 API 响应
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // 处理空响应
  if (response.status === 204) {
    return {} as T;
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    const error: ApiError = {
      error: data.error || 'Unknown error',
      message: data.message || 'An error occurred',
      details: data.details,
      statusCode: response.status,
    };
    throw error;
  }
  
  return data as T;
}

/**
 * 发送 HTTP 请求
 */
export async function request<T>(
  method: HttpMethod,
  path: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, body, timeout = DEFAULT_TIMEOUT, ...restConfig } = config;
  
  // 构建 URL
  const url = buildUrl(path, params);
  
  // 构建请求头
  const headers = new Headers(restConfig.headers);
  
  // 默认 Content-Type
  if (body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // 添加认证 token
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // 构建请求选项
  const fetchOptions: RequestInit = {
    method,
    headers,
    ...restConfig,
  };
  
  // 添加请求体
  if (body) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  
  try {
    // 发送请求（带超时）
    const response = await Promise.race([
      fetch(url, fetchOptions),
      createTimeoutPromise(timeout),
    ]);
    
    return handleResponse<T>(response as Response);
  } catch (error) {
    // 处理超时
    if (error instanceof Error && error.message === 'Request timeout') {
      throw {
        error: 'Timeout',
        message: 'Request timed out. Please try again.',
        statusCode: 408,
      } as ApiError;
    }
    
    // 重新抛出 API 错误
    if ((error as ApiError).statusCode) {
      throw error;
    }
    
    // 网络错误
    throw {
      error: 'Network Error',
      message: error instanceof Error ? error.message : 'Network error occurred',
      statusCode: 0,
    } as ApiError;
  }
}

/**
 * HTTP 方法快捷函数
 */
export const apiClient = {
  get: <T>(path: string, config?: RequestConfig) => 
    request<T>('GET', path, config),
  
  post: <T>(path: string, body?: unknown, config?: RequestConfig) => 
    request<T>('POST', path, { ...config, body: body as BodyInit | null }),
  
  put: <T>(path: string, body?: unknown, config?: RequestConfig) => 
    request<T>('PUT', path, { ...config, body: body as BodyInit | null }),
  
  patch: <T>(path: string, body?: unknown, config?: RequestConfig) => 
    request<T>('PATCH', path, { ...config, body: body as BodyInit | null }),
  
  delete: <T>(path: string, config?: RequestConfig) => 
    request<T>('DELETE', path, config),
};

export default apiClient;

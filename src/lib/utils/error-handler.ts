// src/lib/utils/error-handler.ts
// 统一错误处理和响应工具

import { ZodError } from 'zod';
import { NextResponse } from 'next/server';

// 自定义 API 错误类
export class APIError extends Error {
  statusCode: number;
  code: string;
  
  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

// 常见错误类型
export const Errors = {
  UNAUTHORIZED: (message = '未授权访问') => new APIError(message, 401, 'UNAUTHORIZED'),
  FORBIDDEN: (message = '禁止访问') => new APIError(message, 403, 'FORBIDDEN'),
  NOT_FOUND: (message = '资源不存在') => new APIError(message, 404, 'NOT_FOUND'),
  BAD_REQUEST: (message = '请求参数错误') => new APIError(message, 400, 'BAD_REQUEST'),
  CONFLICT: (message = '资源冲突') => new APIError(message, 409, 'CONFLICT'),
  VALIDATION: (message = '数据验证失败') => new APIError(message, 422, 'VALIDATION_ERROR'),
  INTERNAL: (message = '服务器内部错误') => new APIError(message, 500, 'INTERNAL_ERROR'),
  SERVICE_UNAVAILABLE: (message = '服务暂不可用') => new APIError(message, 503, 'SERVICE_UNAVAILABLE'),
};

// 格式化 Zod 验证错误
export function formatZodError(error: ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });
  return formatted;
}

// 统一错误响应格式
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string> | null;
  };
  timestamp: string;
}

// 创建错误响应
export function createErrorResponse(
  message: string, 
  statusCode: number = 500, 
  code: string = 'INTERNAL_ERROR',
  details: Record<string, string> | null = null
): NextResponse<ErrorResponse> {
  const body: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(body, { status: statusCode });
}

// 成功响应格式
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

// 创建成功响应
export function createSuccessResponse<T>(
  data: T, 
  meta?: SuccessResponse<T>['meta']
): NextResponse<SuccessResponse<T>> {
  const body: SuccessResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(body);
}

// 主错误处理器
export function handleError(error: unknown): NextResponse<ErrorResponse> {
  // 记录错误日志
  console.error('[API Error]', error);
  
  // 处理自定义 API 错误
  if (error instanceof APIError) {
    return createErrorResponse(error.message, error.statusCode, error.code);
  }
  
  // 处理 Zod 验证错误
  if (error instanceof ZodError) {
    const details = formatZodError(error);
    return createErrorResponse('数据验证失败', 422, 'VALIDATION_ERROR', details);
  }
  
  // 处理 Prisma 错误
  if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
    // @ts-expect-error - Prisma error code
    const code = error.code as string;
    
    // 唯一约束冲突
    if (code === 'P2002') {
      // @ts-expect-error - Prisma meta
      const field = error.meta?.target?.[0] || '字段';
      return createErrorResponse(`${field} 已存在`, 409, 'DUPLICATE_ENTRY');
    }
    
    // 外键约束失败
    if (code === 'P2003') {
      return createErrorResponse('关联资源不存在', 400, 'FOREIGN_KEY_ERROR');
    }
    
    // 记录未找到
    if (code === 'P2025') {
      return createErrorResponse('资源不存在', 404, 'NOT_FOUND');
    }
  }
  
  // 处理其他错误
  const message = error instanceof Error ? error.message : '未知错误';
  return createErrorResponse(message, 500, 'INTERNAL_ERROR');
}

// 异步请求包装器
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ErrorResponse>> {
  return handler().catch(handleError) as Promise<NextResponse<T | ErrorResponse>>;
}

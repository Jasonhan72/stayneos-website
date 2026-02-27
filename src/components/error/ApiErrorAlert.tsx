/**
 * API 错误提示组件
 */

'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { ApiError } from '@/types';

interface ApiErrorAlertProps {
  error: ApiError | Error | null;
  onRetry?: () => void;
  className?: string;
}

export function ApiErrorAlert({ error, onRetry, className = '' }: ApiErrorAlertProps) {
  if (!error) return null;

  const isApiError = (error as ApiError).statusCode !== undefined;
  const statusCode = isApiError ? (error as ApiError).statusCode : 500;
  
  // 根据状态码确定错误类型
  const getErrorMessage = () => {
    if (isApiError) {
      switch (statusCode) {
        case 401:
          return '登录已过期，请重新登录';
        case 403:
          return '您没有权限执行此操作';
        case 404:
          return '请求的资源不存在';
        case 408:
          return '请求超时，请检查网络连接';
        case 429:
          return '请求过于频繁，请稍后再试';
        case 500:
        case 502:
        case 503:
          return '服务器暂时不可用，请稍后再试';
        default:
          return (error as ApiError).message || '请求失败，请稍后重试';
      }
    }
    return error.message || '网络错误，请检查网络连接';
  };

  const getErrorType = () => {
    if (statusCode >= 500) return 'error';
    if (statusCode === 401 || statusCode === 403) return 'warning';
    if (statusCode === 404) return 'info';
    return 'error';
  };

  const errorType = getErrorType();
  
  const colors = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[errorType]} ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">{getErrorMessage()}</p>
          
          {process.env.NODE_ENV === 'development' && isApiError && (error as ApiError).details && (
            <pre className="mt-2 text-xs opacity-75 overflow-auto">
              {JSON.stringify((error as ApiError).details, null, 2)}
            </pre>
          )}
        </div>
        
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="flex items-center gap-1 flex-shrink-0"
          >
            <RefreshCw size={14} />
            重试
          </Button>
        )}
      </div>
    </div>
  );
}

export default ApiErrorAlert;

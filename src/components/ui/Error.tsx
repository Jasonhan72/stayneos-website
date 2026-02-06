"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  XCircle,
  RefreshCw,
  Home,
  ArrowLeft,
  Search,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui";

// ============================================================
// Error Page
// ============================================================
interface ErrorPageProps {
  title?: string;
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  onBack?: () => void;
  showHomeLink?: boolean;
  className?: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  title = "出错了",
  message = "抱歉，发生了一些错误。请稍后重试。",
  errorCode,
  onRetry,
  onBack,
  showHomeLink = true,
  className,
}) => {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-neutral-50 px-4",
        className
      )}
    >
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-error" />
        </div>

        {errorCode && (
          <p className="text-sm text-neutral-500 mb-2">错误代码: {errorCode}</p>
        )}

        <h1 className="text-3xl font-bold text-neutral-900 mb-4">{title}</h1>
        <p className="text-neutral-600 mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="primary" className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
          )}
          {onBack && (
            <Button onClick={onBack} variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          )}
          {showHomeLink && (
            <Link href="/" passHref>
              <Button variant="ghost" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 404 Not Found Page
// ============================================================
interface NotFoundPageProps {
  title?: string;
  message?: string;
  showSearch?: boolean;
  className?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  title = "页面未找到",
  message = "抱歉，您访问的页面不存在或已被移除。",
  showSearch = true,
  className,
}) => {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-neutral-50 px-4",
        className
      )}
    >
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-amber-100 flex items-center justify-center">
          <Search className="w-12 h-12 text-warning" />
        </div>

        <p className="text-6xl font-bold text-neutral-200 mb-4">404</p>
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">{title}</h1>
        <p className="text-neutral-600 mb-8">{message}</p>

        {showSearch && (
          <div className="mb-8">
            <div className="relative max-w-sm mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="搜索页面..."
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" passHref>
            <Button variant="primary" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <Link href="/properties" passHref>
            <Button variant="outline" className="w-full sm:w-auto">
              浏览房源
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Network Error Page
// ============================================================
interface NetworkErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const NetworkErrorPage: React.FC<NetworkErrorPageProps> = ({
  title = "网络连接错误",
  message = "无法连接到服务器。请检查您的网络连接并重试。",
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-neutral-50 px-4",
        className
      )}
    >
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-neutral-200 flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-neutral-500" />
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 mb-4">{title}</h1>
        <p className="text-neutral-600 mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="primary" className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试连接
            </Button>
          )}
          <Link href="/" passHref>
            <Button variant="outline" className="w-full sm:w-auto">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Inline Error
// ============================================================
interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-error",
        className
      )}
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium hover:underline"
        >
          重试
        </button>
      )}
    </div>
  );
};

// ============================================================
// Error Boundary Fallback
// ============================================================
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  className?: string;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetErrorBoundary,
  className,
}) => {
  return (
    <div
      className={cn(
        "min-h-[400px] flex items-center justify-center bg-neutral-50 p-8",
        className
      )}
    >
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-error" />
        </div>

        <h2 className="text-xl font-bold text-neutral-900 mb-2">
          组件加载失败
        </h2>
        <p className="text-neutral-600 mb-4">
          此组件在渲染时发生错误。
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-4 bg-neutral-100 text-left overflow-auto max-h-40">
            <p className="text-sm font-mono text-red-600">{error.message}</p>
          </div>
        )}

        <Button onClick={resetErrorBoundary} variant="primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    </div>
  );
};

// ============================================================
// Empty State
// ============================================================
interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "暂无数据",
  message = "这里还没有任何内容。",
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="w-16 h-16 mb-4 bg-neutral-100 flex items-center justify-center">
        {icon || <Search className="w-8 h-8 text-neutral-400" />}
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 max-w-sm mb-6">{message}</p>

      {action}
    </div>
  );
};

export default ErrorPage;

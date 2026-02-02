"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle
                className="w-12 h-12 text-red-600"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              系统错误
            </h1>
            <p className="text-gray-600 mb-4">
              抱歉，应用遇到了严重错误。请刷新页面重试。
            </p>
            {error.digest && (
              <p className="text-sm text-gray-400">错误代码: {error.digest}</p>
            )}
          </div>

          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            刷新页面
          </button>
        </div>
      </body>
    </html>
  );
}

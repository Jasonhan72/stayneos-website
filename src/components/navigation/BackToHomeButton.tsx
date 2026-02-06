// Back to Home Button Component
'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

interface BackToHomeButtonProps {
  className?: string;
  variant?: 'fixed' | 'inline';
}

export function BackToHomeButton({ className = '', variant = 'fixed' }: BackToHomeButtonProps) {
  if (variant === 'fixed') {
    return (
      <Link
        href="/"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-white shadow-lg hover:bg-primary-700 transition-all ${className}`}
        title="返回首页"
      >
        <Home size={20} />
        <span className="hidden sm:inline">首页</span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 px-4 py-2 text-primary hover:text-primary-700 transition-colors ${className}`}
    >
      <Home size={18} />
      <span>返回首页</span>
    </Link>
  );
}

export default BackToHomeButton;

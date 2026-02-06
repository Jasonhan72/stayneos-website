"use client";

import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  leftIcon,
  rightIcon,
}: ButtonProps) {
  // 基础样式 - 确保最小 44x44px 触控区域
  const baseStyles = `
    inline-flex items-center justify-center font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  `;

  // 变体样式 - 使用品牌色 #c9a962 金色
  const variants = {
    // 主要按钮 - 金色品牌色
    primary: `
      bg-accent text-primary
      hover:bg-accent-600 hover:shadow-accent hover:-translate-y-0.5
      focus:ring-accent
      font-semibold
    `,
    // 次要按钮 - 深蓝色
    secondary: `
      bg-primary text-white
      hover:bg-primary-700 hover:shadow-primary hover:-translate-y-0.5
      focus:ring-primary
      font-semibold
    `,
    // 强调按钮 - 另一种金色用法
    accent: `
      bg-accent-500 text-white
      hover:bg-accent-600 hover:shadow-accent hover:-translate-y-0.5
      focus:ring-accent-500
      font-semibold
    `,
    // 轮廓按钮
    outline: `
      border-[1.5px] border-neutral-300 bg-transparent text-neutral-700
      hover:bg-neutral-50 hover:border-neutral-400
      focus:ring-neutral-400
      font-medium
    `,
    // 幽灵按钮
    ghost: `
      bg-transparent text-neutral-600
      hover:bg-neutral-100 hover:text-neutral-900
      focus:ring-neutral-300
      font-medium
    `,
    // 危险按钮
    danger: `
      bg-error text-white
      hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5
      focus:ring-error
      font-semibold
    `,
  };

  // 尺寸样式 - 确保触控区域
  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5 min-h-[36px] rounded-md",
    md: "px-6 py-3 text-sm gap-2 min-h-[44px] rounded-lg",
    lg: "px-8 py-4 text-base gap-2.5 min-h-[56px] rounded-xl",
    icon: "p-2.5 min-w-[44px] min-h-[44px] rounded-lg",
  };

  // 加载状态尺寸
  const loaderSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    icon: 20,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {isLoading && (
        <Loader2 
          size={loaderSizes[size]} 
          className="animate-spin shrink-0" 
          aria-hidden="true" 
        />
      )}
      {!isLoading && leftIcon && (
        <span className="shrink-0">{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}

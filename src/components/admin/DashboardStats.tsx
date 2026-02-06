"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Home,
  Calendar,
  DollarSign,
  Eye,
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ============================================================
// Dashboard Stats Card
// ============================================================
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ElementType;
  variant?: "default" | "primary" | "success" | "warning" | "error";
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  trend,
  icon: Icon,
  variant = "default",
  className,
}) => {
  const variants = {
    default: "bg-white border-neutral-200",
    primary: "bg-primary text-white",
    success: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
    error: "bg-red-50 border-red-200",
  };

  const iconVariants = {
    default: "bg-primary-50 text-primary",
    primary: "bg-primary-700 text-white",
    success: "bg-green-100 text-green-600",
    warning: "bg-amber-100 text-amber-600",
    error: "bg-red-100 text-red-600",
  };

  return (
    <div className={cn("p-6 border", variants[variant], className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium",
            variant === "primary" ? "text-primary-100" : "text-neutral-500"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold mt-2",
            variant === "primary" ? "text-white" : "text-neutral-900"
          )}>
            {value}
          </p>
          
          {(description || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(trend.value)}%
                </span>
              )}
              {description && (
                <span className={cn(
                  "text-sm",
                  variant === "primary" ? "text-primary-100" : "text-neutral-500"
                )}>
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={cn("p-3", iconVariants[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Dashboard Stats Grid
// ============================================================
interface DashboardStatsProps {
  stats?: StatCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  columns = 4,
  className,
}) => {
  const defaultStats: StatCardProps[] = [
    {
      title: "总收入",
      value: "$124,500",
      description: "本月",
      trend: { value: 12.5, isPositive: true },
      icon: DollarSign,
      variant: "primary",
    },
    {
      title: "总预订",
      value: "1,284",
      description: "本月",
      trend: { value: 8.2, isPositive: true },
      icon: Calendar,
    },
    {
      title: "房源数量",
      value: "48",
      description: "活跃房源",
      icon: Home,
    },
    {
      title: "客户数量",
      value: "3,642",
      description: "注册用户",
      trend: { value: 5.1, isPositive: true },
      icon: Users,
    },
  ];

  const displayStats = stats || defaultStats;

  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", columnClasses[columns], className)}>
      {displayStats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

// ============================================================
// Quick Stats Row
// ============================================================
interface QuickStatItemProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ElementType;
}

interface QuickStatsRowProps {
  items?: QuickStatItemProps[];
  className?: string;
}

export const QuickStatsRow: React.FC<QuickStatsRowProps> = ({
  items,
  className,
}) => {
  const defaultItems: QuickStatItemProps[] = [
    {
      label: "今日访问量",
      value: "2,847",
      change: { value: 15, isPositive: true },
      icon: Eye,
    },
    {
      label: "新预订",
      value: "24",
      change: { value: 8, isPositive: true },
      icon: Calendar,
    },
    {
      label: "平均评分",
      value: "4.8",
      change: { value: 0.2, isPositive: true },
      icon: Star,
    },
    {
      label: "入住率",
      value: "87%",
      change: { value: 3, isPositive: false },
      icon: Home,
    },
  ];

  const displayItems = items || defaultItems;

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {displayItems.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 bg-white border border-neutral-200"
        >
          <div className="p-2 bg-primary-50 text-primary">
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">{item.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-neutral-900">{item.value}</p>
              {item.change && (
                <span
                  className={cn(
                    "flex items-center text-xs",
                    item.change.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {item.change.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(item.change.value)}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Chart Stats (Placeholder for charts)
// ============================================================
interface ChartStatsProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ChartStats: React.FC<ChartStatsProps> = ({
  title,
  subtitle,
  className,
  children,
}) => {
  return (
    <div className={cn("bg-white border border-neutral-200 p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      {children || (
        <div className="h-64 flex items-center justify-center bg-neutral-50 text-neutral-400">
          图表区域
        </div>
      )}
    </div>
  );
};

export default DashboardStats;

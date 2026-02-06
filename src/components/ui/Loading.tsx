"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ============================================================
// Full Page Loading Spinner
// ============================================================
interface PageLoadingProps {
  message?: string;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = "加载中...",
  className,
}) => {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center bg-neutral-50",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary animate-spin" />
        </div>
        <p className="text-neutral-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// ============================================================
// Inline Loading Spinner
// ============================================================
interface InlineLoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = "md",
  className,
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizes[size])} />
    </div>
  );
};

// ============================================================
// Loading Card (Skeleton)
// ============================================================
interface LoadingCardProps {
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ className }) => {
  return (
    <div className={cn("bg-white border border-neutral-200 p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-neutral-200 animate-pulse" />
          <div className="h-8 w-32 bg-neutral-200 animate-pulse" />
          <div className="h-4 w-20 bg-neutral-200 animate-pulse" />
        </div>
        <div className="h-12 w-12 bg-neutral-200 animate-pulse" />
      </div>
    </div>
  );
};

// ============================================================
// Loading Table Row
// ============================================================
interface LoadingTableRowProps {
  columns?: number;
  className?: string;
}

export const LoadingTableRow: React.FC<LoadingTableRowProps> = ({
  columns = 5,
  className,
}) => {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-neutral-200 animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
};

// ============================================================
// Loading Table
// ============================================================
interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({
  rows = 5,
  columns = 5,
  className,
}) => {
  return (
    <div className={cn("bg-white border border-neutral-200", className)}>
      <div className="p-4 border-b border-neutral-200">
        <div className="h-6 w-32 bg-neutral-200 animate-pulse" />
      </div>
      <table className="w-full">
        <thead className="bg-neutral-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-20 bg-neutral-200 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {Array.from({ length: rows }).map((_, i) => (
            <LoadingTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================
// Loading Property Card
// ============================================================
interface LoadingPropertyCardProps {
  className?: string;
}

export const LoadingPropertyCard: React.FC<LoadingPropertyCardProps> = ({
  className,
}) => {
  return (
    <div className={cn("bg-white border border-neutral-200 overflow-hidden", className)}>
      <div className="aspect-[4/3] bg-neutral-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-neutral-200 animate-pulse" />
        <div className="h-4 w-1/2 bg-neutral-200 animate-pulse" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-24 bg-neutral-200 animate-pulse" />
          <div className="h-8 w-20 bg-neutral-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Loading Grid
// ============================================================
interface LoadingGridProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const LoadingGrid: React.FC<LoadingGridProps> = ({
  count = 6,
  columns = 3,
  className,
}) => {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", columnClasses[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingPropertyCard key={i} />
      ))}
    </div>
  );
};

// ============================================================
// Loading Content Block
// ============================================================
interface LoadingContentProps {
  lines?: number;
  className?: string;
}

export const LoadingContent: React.FC<LoadingContentProps> = ({
  lines = 4,
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-8 w-3/4 bg-neutral-200 animate-pulse" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-neutral-200 animate-pulse"
          style={{ width: `${80 + Math.random() * 20}%` }}
        />
      ))}
    </div>
  );
};

export default PageLoading;

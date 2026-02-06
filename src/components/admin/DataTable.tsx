"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  MoreHorizontal,
  Filter,
  Download,
} from "lucide-react";

// ============================================================
// DataTable Types
// ============================================================
type SortDirection = "asc" | "desc" | null;

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  title?: string;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  actions?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

// ============================================================
// DataTable Component
// ============================================================
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  title,
  searchable = true,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  selectable = false,
  onRowClick,
  onSelectionChange,
  actions,
  emptyMessage = "暂无数据",
  className,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // Filter data
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey] as string | number;
      const bValue = b[sortKey] as string | number;
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map(keyExtractor)));
    }
  };

  // Handle select row
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectRow = (id: string, row: T) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(
      data.filter((r) => newSelected.has(keyExtractor(r)))
    );
  };

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="w-4 h-4 text-neutral-400" />;
    if (sortDirection === "asc") return <ArrowUp className="w-4 h-4 text-primary" />;
    return <ArrowDown className="w-4 h-4 text-primary" />;
  };

  return (
    <div className={cn("bg-white border border-neutral-200", className)}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {title && <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>}
          
          <div className="flex items-center gap-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="搜索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-48 sm:w-64 border border-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                />
              </div>
            )}
            <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <Download className="w-5 h-5" />
            </button>
            {actions}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 border-neutral-300 text-primary focus:ring-primary"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-semibold text-neutral-700",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right"
                  )}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-1 hover:text-neutral-900"
                    >
                      {column.header}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-neutral-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const id = keyExtractor(row);
                const isSelected = selectedRows.has(id);

                return (
                  <tr
                    key={id}
                    className={cn(
                      "hover:bg-neutral-50 transition-colors",
                      onRowClick && "cursor-pointer",
                      isSelected && "bg-primary-50"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(id, row)}
                          className="w-4 h-4 border-neutral-300 text-primary focus:ring-primary"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-3 text-sm",
                          column.align === "center" && "text-center",
                          column.align === "right" && "text-right"
                        )}
                      >
                        {column.render
                          ? column.render(row)
                          : String(row[column.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="p-4 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span>每页显示</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-neutral-200 px-2 py-1 text-sm focus:outline-none focus:border-primary"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span>条，共 {sortedData.length} 条</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-8 h-8 text-sm font-medium transition-colors",
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// DataTable Actions Dropdown
// ============================================================
interface DataTableActionsProps {
  children: React.ReactNode;
}

export const DataTableActions: React.FC<DataTableActionsProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white border border-neutral-200 shadow-lg z-20">
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export const DataTableActionItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
}> = ({ children, onClick, variant = "default" }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors",
      variant === "danger" && "text-error hover:bg-red-50"
    )}
  >
    {children}
  </button>
);

export default DataTable;

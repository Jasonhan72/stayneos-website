"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import {
  Bell,
  Search,
  User,
  Menu,
  ChevronRight,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export default function AdminLayout({
  children,
  title,
  breadcrumbs,
  actions,
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const autoBreadcrumbs = breadcrumbs || pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => {
      const href = "/" + arr.slice(0, index + 1).join("/");
      return {
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: index === arr.length - 1 ? undefined : href,
      };
    });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Search */}
              <div className="hidden sm:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="搜索..."
                    className="pl-10 pr-4 py-2 w-64 border border-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button
                type="button"
                className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-neutral-900">管理员</p>
                  <p className="text-xs text-neutral-500">admin@stayneos.com</p>
                </div>
                <button
                  type="button"
                  className="w-9 h-9 bg-primary text-white flex items-center justify-center"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            {/* Breadcrumbs */}
            {autoBreadcrumbs.length > 0 && (
              <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                <Link href="/admin" className="hover:text-primary">
                  首页
                </Link>
                {autoBreadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <ChevronRight className="w-4 h-4" />
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-primary">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-neutral-900">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </div>

          {/* Content */}
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-200 py-4 px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-neutral-500">
            <p>© 2024 StayNeos Admin. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/admin/help" className="hover:text-neutral-700">帮助</Link>
              <Link href="/admin/settings" className="hover:text-neutral-700">设置</Link>
              <Link href="/" className="hover:text-neutral-700">返回网站</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

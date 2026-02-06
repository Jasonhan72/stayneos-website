"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  Calendar,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: { label: string; href: string }[];
}

export default function Sidebar({ isCollapsed = false, onCollapseChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const navItems: NavItem[] = [
    { label: "仪表盘", href: "/admin", icon: LayoutDashboard },
    {
      label: "房源管理",
      href: "/admin/properties",
      icon: Home,
      children: [
        { label: "所有房源", href: "/admin/properties" },
        { label: "添加房源", href: "/admin/properties/new" },
        { label: "房源类型", href: "/admin/properties/types" },
      ],
    },
    {
      label: "预订管理",
      href: "/admin/bookings",
      icon: Calendar,
      badge: 3,
      children: [
        { label: "所有预订", href: "/admin/bookings" },
        { label: "待确认", href: "/admin/bookings/pending" },
        { label: "进行中", href: "/admin/bookings/active" },
      ],
    },
    {
      label: "客户管理",
      href: "/admin/customers",
      icon: Users,
      children: [
        { label: "所有客户", href: "/admin/customers" },
        { label: "客户反馈", href: "/admin/customers/feedback" },
      ],
    },
    { label: "消息中心", href: "/admin/messages", icon: MessageSquare, badge: 5 },
    { label: "财务报表", href: "/admin/reports", icon: BarChart3 },
    { label: "内容管理", href: "/admin/content", icon: FileText },
    { label: "系统设置", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-primary text-white transition-all duration-300 z-40 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-primary-700">
        <Link href="/admin" className="flex items-center">
          {collapsed ? (
            <span className="text-xl font-bold text-accent">S</span>
          ) : (
            <span className="text-xl font-bold">
              Stay
              <span className="text-accent">Neos</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.href);

            return (
              <li key={item.href}>
                {hasChildren && !collapsed ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.href)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-primary-700 text-accent"
                          : "text-primary-100 hover:bg-primary-700 hover:text-white"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-accent text-primary text-xs font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <ul className="mt-1 ml-4 pl-4 border-l border-primary-600 space-y-1">
                        {item.children?.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "block px-3 py-2 text-sm transition-colors",
                                isActive(child.href)
                                  ? "text-accent"
                                  : "text-primary-200 hover:text-white"
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                      collapsed ? "justify-center" : "",
                      active
                        ? "bg-primary-700 text-accent"
                        : "text-primary-100 hover:bg-primary-700 hover:text-white"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-accent text-primary text-xs font-bold">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-primary-700 p-2">
        <button
          type="button"
          onClick={toggleCollapse}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-primary-200 hover:text-white hover:bg-primary-700 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "展开菜单" : "收起菜单"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>收起菜单</span>
            </>
          )}
        </button>

        <Link
          href="/logout"
          className={cn(
            "mt-1 flex items-center gap-3 px-3 py-2.5 text-sm text-primary-200 hover:text-white hover:bg-primary-700 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "退出登录" : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>退出登录</span>}
        </Link>
      </div>
    </aside>
  );
}

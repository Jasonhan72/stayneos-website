"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, DollarSign, Home, LayoutDashboard, MessageSquare } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const items: Array<{ href: string; key: string; icon: React.ComponentType<{ className?: string }>; badge?: number }> = [
  { href: "/host", key: "host.nav.today", icon: LayoutDashboard },
  { href: "/host/listings", key: "host.nav.listings", icon: Home },
  { href: "/host/calendar", key: "host.nav.calendar", icon: Calendar },
  { href: "/host/reservations", key: "host.nav.reservations", icon: BookOpen },
  { href: "/host/inbox", key: "host.nav.inbox", icon: MessageSquare, badge: 0 },
  { href: "/host/earnings", key: "host.nav.earnings", icon: DollarSign },
] as const;

export default function HostSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <>
      <aside className="hidden md:block w-60 shrink-0">
        <div className="sticky top-20 rounded-2xl border border-neutral-200 bg-white p-3">
          <nav className="space-y-1">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                    active ? "bg-neutral-50 font-semibold text-neutral-900" : "text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  <span className={cn("absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full", active ? "bg-primary" : "bg-transparent")} />
                  <Icon className="h-4 w-4" />
                  <span>{t(item.key)}</span>
                  {typeof item.badge === "number" ? (
                    <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">{item.badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="md:hidden -mx-4 overflow-x-auto border-b border-neutral-200 bg-white">
        <nav className="flex min-w-max gap-2 px-4 py-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap",
                  active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-600"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

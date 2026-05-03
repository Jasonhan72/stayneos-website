"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Bell, ChevronRight, Globe, HelpCircle, LockKeyhole, CreditCard, Shield, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/account/personal-info", icon: UserRound, key: "personal" },
  { href: "/account/login-security", icon: LockKeyhole, key: "security" },
  { href: "/account/privacy", icon: Shield, key: "privacy" },
  { href: "/account/notifications", icon: Bell, key: "notifications" },
  { href: "/account/payments", icon: CreditCard, key: "payments" },
  { href: "/account/preferences", icon: Globe, key: "preferences" },
];

export function AccountDesktopShell({ children, title, description, aside }: { children: React.ReactNode; title: string; description?: string; aside?: React.ReactNode }) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const L = useCallback((z: string, e: string, f: string) => (locale === "zh" ? z : locale === "fr" ? f : e), [locale]);
  const labelMap: Record<string, string> = {
    personal: L("个人信息", "Personal information", "Informations personnelles"),
    security: L("登录与安全", "Login & security", "Connexion et sécurité"),
    privacy: L("隐私", "Privacy", "Confidentialité"),
    notifications: L("通知", "Notifications", "Notifications"),
    payments: L("支付", "Payments", "Paiements"),
    preferences: L("语言与货币", "Languages & currency", "Langues et devise"),
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="hidden border-b border-neutral-200 lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link href="/" className="inline-flex items-center">
            <Image src="/logo.png" alt="NEOS" width={140} height={36} className="h-9 w-auto" priority />
          </Link>
          <Link href="/" className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50">{L("完成", "Done", "Terminé")}</Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] gap-12 px-4 py-10 sm:px-6 lg:px-10">
        <aside className="hidden w-[260px] shrink-0 lg:block">
          <h1 className="text-[32px] font-semibold tracking-tight text-neutral-950">{L("账号设置", "Account settings", "Paramètres du compte")}</h1>
          <nav className="mt-8 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] transition",
                    active ? "bg-neutral-100 text-neutral-950" : "text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{labelMap[item.key]}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <Link href="/help" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-neutral-700 transition hover:bg-neutral-50">
              <HelpCircle className="h-5 w-5" />
              <span className="font-medium">{L("帮助中心", "Help Centre", "Centre d'aide")}</span>
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="lg:hidden">
            <Link href="/account" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-800">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Link>
            <h1 className="mt-6 text-[34px] font-semibold tracking-tight text-neutral-950">{title}</h1>
            {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p> : null}
          </div>

          <div className="hidden lg:block">
            <h2 className="text-[32px] font-semibold tracking-tight text-neutral-950">{title}</h2>
            {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p> : null}
          </div>

          <div className={cn("mt-8", aside ? "grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]" : "") }>
            <div>{children}</div>
            {aside ? <div className="mt-8 xl:hidden">{aside}</div> : null}
            {aside ? <div className="hidden xl:block">{aside}</div> : null}
          </div>
        </main>
      </div>
    </div>
  );
}

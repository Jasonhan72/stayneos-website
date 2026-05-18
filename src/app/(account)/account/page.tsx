"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Bell, Globe, HelpCircle, LogOut, Scale, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/UserContext";

export default function AccountIndexPage() {
  const { locale } = useI18n();
  const { logout } = useAuth();
  const router = useRouter();
  const L = useCallback((z: string, e: string, f: string) => (locale === "zh" ? z : locale === "fr" ? f : e), [locale]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      router.replace("/account/personal-info");
    }
  }, [router]);

  const items = [
    { href: "/account/personal-info", icon: Settings, label: L("账号设置", "Account settings", "Paramètres du compte") },
    { href: "/account/preferences", icon: Globe, label: L("语言和货币", "Languages & currency", "Langues et devise") },
    { href: "/help", icon: HelpCircle, label: L("获取帮助", "Get help", "Obtenir de l'aide") },
    { href: "/legal", icon: Scale, label: L("法律条款", "Legal", "Mentions légales") },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto min-h-screen max-w-md px-5 pb-10 pt-5 lg:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-neutral-950">{L("菜单", "Menu", "Menu")}</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={L("通知", "Notifications", "Notifications")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-900"
            >
              <Bell className="h-5 w-5" strokeWidth={1.9} />
            </button>
            <Link
              href="/"
              aria-label={L("关闭菜单", "Close menu", "Fermer le menu")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-900"
            >
              <X className="h-5 w-5" strokeWidth={1.9} />
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] bg-[#F4F1EB] px-6 pb-7 pt-8">
          <div className="relative mx-auto h-[150px] w-[260px]">
            <div className="absolute left-0 top-[30px] h-[96px] w-[118px] rotate-[-7deg] overflow-hidden rounded-[24px] shadow-[0_14px_30px_rgba(0,0,0,0.12)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/cooper-55-c5e8357d-640.webp" alt="NEOS stay" width={118} height={96} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="absolute left-[74px] top-[8px] h-[96px] w-[112px] overflow-hidden rounded-[24px] shadow-[0_14px_30px_rgba(0,0,0,0.1)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/cooper-55-15c489d2-640.webp" alt="NEOS stay" width={112} height={96} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="absolute right-0 top-[28px] h-[100px] w-[122px] rotate-[7deg] overflow-hidden rounded-[24px] shadow-[0_14px_30px_rgba(0,0,0,0.12)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/cooper-55-dining-640.webp" alt="NEOS stay" width={122} height={100} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
          </div>

          <h2 className="mt-3 text-center text-[30px] font-semibold tracking-[-0.03em] text-neutral-950">
            {L("刚开始使用 NEOS？", "New to NEOS?", "Nouveau sur NEOS ?")}
          </h2>
          <p className="mx-auto mt-3 max-w-[280px] text-center text-[15px] leading-6 text-neutral-600">
            {L(
              "查看贴士和推荐做法，让你的入住体验更顺畅。",
              "Get tips and recommendations to make the most of your stay.",
              "Découvrez des conseils et recommandations pour profiter au mieux de votre séjour."
            )}
          </p>
          <Link
            href="/account/personal-info"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-white text-[16px] font-medium text-neutral-900 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          >
            {L("开始", "Get started", "Commencer")}
          </Link>
        </div>

        <div className="mt-7">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex min-h-[68px] items-center gap-4 py-5 text-left">
                <Icon className="h-6 w-6 shrink-0 text-neutral-700" strokeWidth={1.9} />
                <span className="text-[18px] font-medium text-neutral-950">{item.label}</span>
              </Link>
            );
          })}

          <div className="my-3 border-t border-neutral-200" />

          <button onClick={() => logout()} className="flex min-h-[68px] w-full items-center gap-4 py-5 text-left">
            <LogOut className="h-6 w-6 shrink-0 text-neutral-700" strokeWidth={1.9} />
            <span className="text-[18px] font-medium text-neutral-950">{L("退出登录", "Log out", "Déconnexion")}</span>
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1440px] px-6 py-12">
          <h1 className="text-[44px] font-semibold tracking-tight text-neutral-950">{L("账号设置", "Account settings", "Paramètres du compte")}</h1>
          <p className="mt-3 text-base text-neutral-600">{L("从这里管理个人信息、登录与安全、支付方式、通知和语言偏好。", "Manage your personal info, security, payments, notifications, and language preferences here.", "Gérez ici vos informations personnelles, votre sécurité, vos paiements, vos notifications et vos préférences linguistiques.")}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="rounded-[24px] border border-neutral-200 p-6 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                  <Icon className="h-6 w-6 text-neutral-700" />
                  <div className="mt-4 text-lg font-semibold text-neutral-950">{item.label}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Bell, ChevronRight, HelpCircle, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/UserContext";

export default function AccountIndexPage() {
  const { locale } = useI18n();
  const { user, logout } = useAuth();
  const router = useRouter();
  const L = useCallback((z: string, e: string, f: string) => (locale === "zh" ? z : locale === "fr" ? f : e), [locale]);
  const name = (user?.firstName || user?.name || user?.email || "NEOS").toUpperCase();

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      router.replace("/account/personal-info");
    }
  }, [router]);

  const items = [
    { href: "/account/personal-info", icon: Settings, label: L("账号设置", "Account settings", "Paramètres du compte") },
    { href: "/help", icon: HelpCircle, label: L("获取帮助", "Get help", "Obtenir de l'aide") },
    { href: "/legal", icon: Settings, label: L("法律条款", "Legal", "Mentions légales") },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-5 py-6 lg:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-[40px] font-semibold tracking-tight text-neutral-950">{L("菜单", "Menu", "Menu")}</h1>
          <div className="flex items-center gap-3">
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900"><Bell className="h-5 w-5" /></button>
            <div className="text-sm font-semibold uppercase tracking-[0.06em] text-[#9f1d22]">{name}</div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] bg-neutral-100 p-5">
          <div className="relative h-28">
            <div className="absolute left-3 top-4 h-20 w-16 rotate-[-10deg] overflow-hidden rounded-2xl bg-[url('/images/hero/toronto-skyline.jpg')] bg-cover bg-center shadow-md" />
            <div className="absolute left-16 top-0 h-24 w-20 rotate-[8deg] overflow-hidden rounded-2xl bg-[url('/images/hero/city-apartment.png')] bg-cover bg-center shadow-lg" />
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-neutral-950">{L("开始完善账号", "New to NEOS?", "Nouveau sur NEOS ?")}</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{L("补全个人信息、通知和支付方式，获得更顺畅的入住体验。", "Finish your profile, notifications, and payment details for a smoother stay.", "Complétez votre profil, vos notifications et vos paiements pour un séjour plus fluide.")}</p>
          <Link href="/account/personal-info" className="mt-5 inline-flex rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white">{L("开始", "Get started", "Commencer")}</Link>
        </div>

        <div className="mt-8 divide-y divide-neutral-200 rounded-[28px] border border-neutral-200 bg-white">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex min-h-16 items-center gap-4 px-5 py-4">
                <Icon className="h-6 w-6 text-neutral-700" />
                <span className="flex-1 text-[16px] font-medium text-neutral-950">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-neutral-400" />
              </Link>
            );
          })}
          <button onClick={() => logout()} className="flex min-h-16 w-full items-center gap-4 px-5 py-4 text-left">
            <LogOut className="h-6 w-6 text-neutral-700" />
            <span className="flex-1 text-[16px] font-medium text-neutral-950">{L("退出登录", "Log out", "Déconnexion")}</span>
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1440px] px-6 py-12">
          <h1 className="text-[44px] font-semibold tracking-tight text-neutral-950">{L("账号设置", "Account settings", "Paramètres du compte")}</h1>
          <p className="mt-3 text-base text-neutral-600">{L("从这里管理个人信息、登录与安全、支付方式、通知和语言偏好。", "Manage your personal info, security, payments, notifications, and language preferences here.", "Gérez ici vos informations personnelles, votre sécurité, vos paiements, vos notifications et vos préférences linguistiques.")}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.slice(0,2).concat([{ href: '/account/preferences', icon: Settings, label: L('语言与货币','Languages & currency','Langues et devise') }]).map((item) => {
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

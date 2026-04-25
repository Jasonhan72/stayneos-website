"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import {
  User,
  ShieldCheck,
  Lock,
  Bell,
  Wallet,
  Globe,
  MapPin,
  Heart,
  Plane,
  Trash2,
  Laptop,
  Building2,
  FileText,
} from "lucide-react";

export default function AccountIndexPage() {
  const { locale } = useI18n();
  const { user } = useAuth();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  const showBusiness =
    user?.role === "HOST" ||
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    (user as { accountType?: string } | null)?.accountType === "business";

  interface Item {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: { zh: string; en: string; fr: string };
    show?: boolean;
  }

  const items: Item[] = [
    { href: "/account/personal-info", icon: User, label: { zh: "个人信息", en: "Personal info", fr: "Informations personnelles" } },
    { href: "/account/login-security", icon: ShieldCheck, label: { zh: "登录与安全", en: "Login & security", fr: "Connexion et sécurité" } },
    { href: "/account/privacy", icon: Lock, label: { zh: "隐私", en: "Privacy", fr: "Confidentialité" } },
    { href: "/account/notifications", icon: Bell, label: { zh: "通知", en: "Notifications", fr: "Notifications" } },
    { href: "/account/payments", icon: Wallet, label: { zh: "支付方式", en: "Payment methods", fr: "Moyens de paiement" } },
    { href: "/account/addresses", icon: MapPin, label: { zh: "地址", en: "Addresses", fr: "Adresses" } },
    { href: "/account/preferences", icon: Globe, label: { zh: "偏好设置", en: "Preferences", fr: "Préférences" } },
    { href: "/wishlists", icon: Heart, label: { zh: "收藏", en: "Wishlists", fr: "Favoris" } },
    { href: "/bookings", icon: Plane, label: { zh: "行程", en: "Trips", fr: "Voyages" } },
    { href: "/account/taxes", icon: FileText, label: { zh: "税费", en: "Taxes", fr: "Taxes" } },
    { href: "/account/business", icon: Building2, label: { zh: "商务差旅", en: "Business travel", fr: "Voyages d'affaires" }, show: showBusiness },
    { href: "/account/pro-tools", icon: Laptop, label: { zh: "专业运营工具", en: "Professional tools", fr: "Outils professionnels" }, show: showBusiness },
    { href: "/account/delete-account", icon: Trash2, label: { zh: "注销账户", en: "Delete account", fr: "Supprimer le compte" } },
  ];

  const pick = (l: { zh: string; en: string; fr: string }) =>
    locale === "zh" ? l.zh : locale === "fr" ? l.fr : l.en;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">
        {L("账户设置", "Account settings", "Paramètres du compte")}
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        {L("管理您的账户信息和设置", "Manage your account info and settings", "Gérez vos informations et paramètres")}
      </p>

      <div className="divide-y divide-neutral-100 border-t border-b border-neutral-200">
        {items
          .filter((item) => item.show !== false)
          .map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between py-4 hover:bg-neutral-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    <Icon className="h-5 w-5 text-neutral-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-900">
                    {pick(item.label)}
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            );
          })}
      </div>
    </div>
  );
}

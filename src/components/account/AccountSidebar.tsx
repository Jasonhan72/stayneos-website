"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  User,
  ShieldCheck,
  Lock,
  Bell,
  Receipt,
  Wallet,
  Globe,
  CreditCard,
  Briefcase,
  Building2,
  Wrench,
  SparklesIcon,
} from "lucide-react";

type Item = {
  href: string;
  label: { zh: string; en: string; fr: string };
  icon: React.ComponentType<{ className?: string }>;
};

// Mirrors Airbnb Account Settings structure
const topItems: Item[] = [
  {
    href: "/account/personal-info",
    label: { zh: "个人信息", en: "Personal info", fr: "Informations personnelles" },
    icon: User,
  },
  {
    href: "/account/login-security",
    label: { zh: "登录与安全", en: "Login & security", fr: "Connexion et sécurité" },
    icon: ShieldCheck,
  },
  {
    href: "/account/privacy",
    label: { zh: "隐私", en: "Privacy", fr: "Confidentialité" },
    icon: Lock,
  },
  {
    href: "/account/notifications",
    label: { zh: "通知", en: "Notifications", fr: "Notifications" },
    icon: Bell,
  },
  {
    href: "/account/taxes",
    label: { zh: "税费", en: "Taxes", fr: "Taxes" },
    icon: Receipt,
  },
  {
    href: "/account/payments",
    label: { zh: "付款和收款", en: "Payments & payouts", fr: "Paiements et versements" },
    icon: Wallet,
  },
  {
    href: "/account/preferences",
    label: { zh: "语言和货币", en: "Language & currency", fr: "Langue et devise" },
    icon: Globe,
  },
  {
    href: "/account/booking-access",
    label: { zh: "预订权限", en: "Booking access", fr: "Accès aux réservations" },
    icon: CreditCard,
  },
  {
    href: "/account/business",
    label: { zh: "商务差旅", en: "Business travel", fr: "Voyages d'affaires" },
    icon: Briefcase,
  },
];

const bottomItems: Item[] = [
  {
    href: "/account/corporate",
    label: { zh: "企业详情", en: "Corporate details", fr: "Informations d'entreprise" },
    icon: Building2,
  },
  {
    href: "/account/pro-tools",
    label: { zh: "专业运营工具", en: "Professional tools", fr: "Outils professionnels" },
    icon: Wrench,
  },
  {
    href: "/account/personalization",
    label: { zh: "个性化推荐", en: "Personalization", fr: "Personnalisation" },
    icon: SparklesIcon,
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const pick = (l: Item["label"]) =>
    locale === "zh" ? l.zh : locale === "fr" ? l.fr : l.en;

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <nav className="flex flex-col gap-1" aria-label="Account navigation">
        {topItems.map((it) => (
          <Row key={it.href} item={it} active={isActive(pathname, it.href)} label={pick(it.label)} />
        ))}
        <div className="my-3 border-t border-neutral-200" />
        {bottomItems.map((it) => (
          <Row key={it.href} item={it} active={isActive(pathname, it.href)} label={pick(it.label)} />
        ))}
      </nav>
    </aside>
  );
}

function Row({
  item,
  active,
  label,
}: {
  item: Item;
  active: boolean;
  label: string;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-neutral-100 text-neutral-900 font-medium"
          : "text-neutral-700 hover:bg-neutral-50"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("w-4 h-4", active ? "text-neutral-900" : "text-neutral-500")} />
      <span>{label}</span>
    </Link>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (pathname === href) return true;
  // allow locale-prefixed paths like /zh/account/personal-info
  return pathname.endsWith(href);
}

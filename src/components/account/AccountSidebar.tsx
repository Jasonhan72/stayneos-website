"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { User, ShieldCheck, Lock, Bell, Receipt, Wallet, Globe, Briefcase, Building2, Wrench, MapPin, Heart, Plane } from "lucide-react";

type Label = { zh: string; en: string; fr: string };
type Item = { href: string; label: Label; icon: React.ComponentType<{ className?: string }>; hidden?: boolean; };
type Section = { title: Label; items: Item[]; hidden?: boolean };

export default function AccountSidebar() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const { user } = useAuth();
  const pick = (l: Label) => locale === "zh" ? l.zh : locale === "fr" ? l.fr : l.en;
  const showBusiness = user?.role === 'HOST' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || (user as { accountType?: string } | null)?.accountType === 'business';

  const sections: Section[] = [
    { title: { zh: "Personal", en: "Personal", fr: "Personnel" }, items: [
      { href: "/account/personal-info", label: { zh: "个人信息", en: "Personal info", fr: "Informations personnelles" }, icon: User },
      { href: "/account/addresses", label: { zh: "地址", en: "Addresses", fr: "Adresses" }, icon: MapPin },
      { href: "/account/login-security", label: { zh: "登录与安全", en: "Login & security", fr: "Connexion et sécurité" }, icon: ShieldCheck },
    ]},
    { title: { zh: "Preferences", en: "Preferences", fr: "Préférences" }, items: [
      { href: "/account/notifications", label: { zh: "通知", en: "Notifications", fr: "Notifications" }, icon: Bell },
      { href: "/account/preferences", label: { zh: "偏好设置", en: "Preferences", fr: "Préférences" }, icon: Globe },
      { href: "/account/privacy", label: { zh: "隐私", en: "Privacy", fr: "Confidentialité" }, icon: Lock },
    ]},
    { title: { zh: "Travel", en: "Travel", fr: "Voyages" }, items: [
      { href: "/bookings", label: { zh: "行程", en: "Trips", fr: "Voyages" }, icon: Plane },
      { href: "/wishlists", label: { zh: "已保存房源", en: "Saved listings", fr: "Annonces enregistrées" }, icon: Heart },
      { href: "/account/payments", label: { zh: "支付方式", en: "Payment methods", fr: "Moyens de paiement" }, icon: Wallet },
      { href: "/account/taxes", label: { zh: "税费", en: "Taxes", fr: "Taxes" }, icon: Receipt },
    ]},
    { title: { zh: "Business", en: "Business", fr: "Professionnel" }, hidden: !showBusiness, items: [
      { href: "/account/business", label: { zh: "商务差旅", en: "Business travel", fr: "Voyages d'affaires" }, icon: Briefcase },
      { href: "/account/corporate", label: { zh: "企业详情", en: "Corporate details", fr: "Informations d'entreprise" }, icon: Building2 },
      { href: "/account/pro-tools", label: { zh: "专业运营工具", en: "Professional tools", fr: "Outils professionnels" }, icon: Wrench },
    ]},
  ];

  return <aside className="w-64 shrink-0 hidden md:block"><nav className="flex flex-col gap-5" aria-label="Account navigation">{sections.filter((section) => !section.hidden).map((section) => <div key={section.title.en}><div className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">{pick(section.title)}</div><div className="flex flex-col gap-1">{section.items.filter((item) => !item.hidden).map((it) => <Row key={it.href} item={it} active={isActive(pathname, it.href)} label={pick(it.label)} />)}</div></div>)}</nav></aside>;
}

function Row({ item, active, label }: { item: Item; active: boolean; label: string; }) { const Icon = item.icon; return <Link href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", active ? "bg-neutral-100 text-neutral-900 font-medium" : "text-neutral-700 hover:bg-neutral-50")} aria-current={active ? "page" : undefined}><Icon className={cn("w-4 h-4", active ? "text-neutral-900" : "text-neutral-500")} /><span>{label}</span></Link>; }
function isActive(pathname: string | null, href: string) { if (!pathname) return false; if (pathname === href) return true; return pathname.endsWith(href); }

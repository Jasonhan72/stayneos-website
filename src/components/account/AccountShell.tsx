"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import {
  BadgeCheck,
  Bell,
  Briefcase,
  Building2,
  CreditCard,
  Globe2,
  LockKeyhole,
  MapPin,
  Shield,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AccountPageIntroProps = {
  title: string;
  description: string;
  eyebrow?: string;
  aside?: React.ReactNode;
};

export function AccountPageIntro({ title, description, eyebrow, aside }: AccountPageIntroProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div>
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{eyebrow}</p>
        ) : null}
        <h1 className="text-[32px] font-semibold tracking-tight text-neutral-950 sm:text-[40px]">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">{description}</p>
      </div>
      {aside ? <div className="hidden lg:block">{aside}</div> : null}
    </div>
  );
}

export function AccountSectionCard({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-4 border-b border-neutral-100 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function AccountInfoAside({ title, body }: { title: string; body: string }) {
  return (
    <aside className="rounded-[24px] border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
        <BadgeCheck className="h-5 w-5 text-neutral-700" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-neutral-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{body}</p>
    </aside>
  );
}

export function AccountRow({ label, value, hint, action, expanded }: { label: string; value?: React.ReactNode; hint?: React.ReactNode; action?: React.ReactNode; expanded?: React.ReactNode }) {
  return (
    <div className="border-b border-neutral-200 px-6 py-6 last:border-b-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-base font-medium text-neutral-950">{label}</div>
          {value !== undefined ? <div className="mt-1 text-sm text-neutral-950">{value}</div> : null}
          {hint ? <div className="mt-2 text-sm leading-6 text-neutral-500">{hint}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {expanded ? <div className="mt-5">{expanded}</div> : null}
    </div>
  );
}

export function AccountActionLink({ children, onClick, danger, disabled }: { children: React.ReactNode; onClick?: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center text-sm font-medium underline underline-offset-4 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        danger ? "text-red-600 hover:text-red-700" : "text-neutral-950 hover:text-neutral-700"
      )}
    >
      {children}
    </button>
  );
}

export function AccountPrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50",
        props.className
      )}
    >
      {children}
    </button>
  );
}

export function AccountSecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50",
        props.className
      )}
    >
      {children}
    </button>
  );
}

export function AccountTextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950", props.className)} />;
}

export function AccountSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("min-w-[170px] rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-950", props.className)} />;
}

export function AccountPageNav() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const L = useCallback((z: string, e: string, f: string) => (locale === "zh" ? z : locale === "fr" ? f : e), [locale]);

  const items = useMemo(
    () => [
      { href: "/account/personal-info", label: L("个人信息", "Personal info", "Informations personnelles"), desc: L("姓名、邮箱、电话", "Name, email, phone", "Nom, e-mail, téléphone"), icon: UserRound },
      { href: "/account/login-security", label: L("登录与安全", "Login & security", "Connexion et sécurité"), desc: L("密码、会话、验证", "Password, sessions, verification", "Mot de passe, sessions, vérification"), icon: LockKeyhole },
      { href: "/account/payments", label: L("支付与收款", "Payments & payouts", "Paiements et versements"), desc: L("卡片、发票、结算", "Cards, invoices, billing", "Cartes, factures, paiements"), icon: CreditCard },
      { href: "/account/taxes", label: L("税务", "Taxes", "Taxes"), desc: L("税表与资料", "Tax forms and details", "Formulaires fiscaux"), icon: BadgeCheck },
      { href: "/account/notifications", label: L("通知", "Notifications", "Notifications"), desc: L("邮件、短信、推送", "Email, SMS, push", "E-mail, SMS, push"), icon: Bell },
      { href: "/account/privacy", label: L("隐私与分享", "Privacy & sharing", "Confidentialité et partage"), desc: L("数据、导出、删除", "Data, export, deletion", "Données, export, suppression"), icon: Shield },
      { href: "/account/preferences", label: L("全局偏好", "Global preferences", "Préférences globales"), desc: L("语言、货币、显示", "Language, currency, display", "Langue, devise, affichage"), icon: Globe2 },
      { href: "/account/addresses", label: L("地址", "Addresses", "Adresses"), desc: L("账单与入住地址", "Billing and stay addresses", "Adresses de facturation"), icon: MapPin },
      { href: "/account/business", label: L("商务出行", "Travel for work", "Voyages d'affaires"), desc: L("企业差旅与政策", "Corporate travel and policy", "Voyages et politique pro"), icon: Briefcase },
      { href: "/account/pro-tools", label: L("专业工具", "Professional hosting tools", "Outils d'hébergement pro"), desc: L("房东与企业能力", "Host and business tools", "Outils hôte et entreprise"), icon: Building2 },
    ],
    [L]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group rounded-[24px] border p-6 transition duration-200",
              active
                ? "border-neutral-900 bg-neutral-950 text-white"
                : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            )}
          >
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-full", active ? "bg-white/12" : "bg-neutral-100 text-neutral-700") }>
              <Icon className="h-5 w-5" />
            </div>
            <div className={cn("mt-5 text-lg font-semibold", active ? "text-white" : "text-neutral-950")}>{item.label}</div>
            <div className={cn("mt-2 text-sm leading-6", active ? "text-white/78" : "text-neutral-500")}>{item.desc}</div>
          </Link>
        );
      })}
    </div>
  );
}

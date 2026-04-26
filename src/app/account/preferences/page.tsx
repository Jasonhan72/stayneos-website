"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { AccountActionLink, AccountRow, AccountSectionCard, AccountSelect } from "@/components/account/AccountShell";
import { AccountDesktopShell } from "@/components/account/AccountDesktopShell";

export default function PreferencesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale, setLocale } = useI18n();
  const L = useCallback((z: string, e: string, f: string) => (locale === "zh" ? z : locale === "fr" ? f : e), [locale]);
  const [currency, setCurrency] = useState('CAD');

  if (isLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="mx-auto max-w-5xl px-6 py-16"><div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div></div>;

  return (
    <AccountDesktopShell title={L("语言与货币", "Languages & currency", "Langues et devise")} description={L("设置浏览语言与显示货币。", "Set your browsing language and display currency.", "Définissez votre langue et votre devise d'affichage.")}>
      <AccountSectionCard title={L("显示偏好", "Display preferences", "Préférences d’affichage")}>
        <AccountRow label={L("语言", "Language", "Langue")} value={<AccountSelect value={locale} onChange={(e) => setLocale(e.target.value as 'en'|'zh'|'fr')}><option value="en">English</option><option value="zh">中文</option><option value="fr">Français</option></AccountSelect>} action={<AccountActionLink>{L("编辑", "Edit", "Modifier")}</AccountActionLink>} />
        <AccountRow label={L("货币", "Currency", "Devise")} value={<AccountSelect value={currency} onChange={(e) => setCurrency(e.target.value)}><option>CAD</option><option>USD</option><option>EUR</option></AccountSelect>} action={<AccountActionLink>{L("编辑", "Edit", "Modifier")}</AccountActionLink>} />
      </AccountSectionCard>
    </AccountDesktopShell>
  );
}

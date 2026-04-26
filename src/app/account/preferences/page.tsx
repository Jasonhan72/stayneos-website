"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Globe, Moon, DollarSign, Layout, MessageSquare, Ruler, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/context/UserContext";
import { useToastHelpers } from "@/components/ui/Toast";

type PreferencesState = {
  language: string;
  currency: string;
  theme: string;
  contentDensity: string;
  dateFormat: string;
  firstDayOfWeek: string;
  messageSort: string;
};

const DEFAULTS: PreferencesState = {
  language: "en",
  currency: "CAD",
  theme: "system",
  contentDensity: "comfortable",
  dateFormat: "MMM D, YYYY",
  firstDayOfWeek: "monday",
  messageSort: "newest",
};

export default function PreferencesPage() {
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const { user, isAuthenticated, isLoading, updatePreferences } = useAuth();
  const toast = useToastHelpers();
  const [values, setValues] = useState<PreferencesState>(DEFAULTS);
  const [pageLoading, setPageLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const L = useCallback((z: string, e: string, f: string) => locale === "zh" ? z : locale === "fr" ? f : e, [locale]);

  const load = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await fetch("/api/account/preferences", { credentials: "include", cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load preferences");
      const prefs = payload.preferences || DEFAULTS;
      setValues({
        language: prefs.language || DEFAULTS.language,
        currency: prefs.currency || DEFAULTS.currency,
        theme: prefs.theme || DEFAULTS.theme,
        contentDensity: prefs.contentDensity || DEFAULTS.contentDensity,
        dateFormat: prefs.accessibilityOptions?.dateFormat || DEFAULTS.dateFormat,
        firstDayOfWeek: prefs.accessibilityOptions?.firstDayOfWeek || DEFAULTS.firstDayOfWeek,
        messageSort: prefs.accessibilityOptions?.messageSort || DEFAULTS.messageSort,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load preferences");
    } finally {
      setPageLoading(false);
    }
  }, [toast]);

  useEffect(() => { if (isAuthenticated) void load(); else setPageLoading(false); }, [isAuthenticated, load]);

  const save = useCallback(async (key: keyof PreferencesState, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    setSavingKey(key);
    try {
      const response = await fetch("/api/account/preferences", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Failed to save preferences");
      await updatePreferences({ language: next.language as "en" | "zh" | "fr", currency: next.currency as "CAD" | "USD" | "EUR" | "CNY" });
      toast.success(L("偏好已保存", "Preferences saved", "Préférences enregistrées"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save preferences");
      await load();
    } finally {
      setSavingKey(null);
    }
  }, [values, updatePreferences, toast, L, load]);

  const sections = useMemo(() => ([
    { id: "general", title: L("通用", "General", "Général"), rows: [
      { key: "language", icon: <Globe className="h-5 w-5" />, label: L("语言", "Language", "Langue"), options: [{ value: "en", label: "English" }, { value: "zh", label: "中文" }, { value: "fr", label: "Français" }] },
      { key: "currency", icon: <DollarSign className="h-5 w-5" />, label: L("货币", "Currency", "Devise"), options: [{ value: "CAD", label: "CAD ($)" }, { value: "USD", label: "USD ($)" }, { value: "EUR", label: "EUR (€)" }] },
      { key: "theme", icon: <Moon className="h-5 w-5" />, label: L("主题", "Theme", "Thème"), options: [{ value: "system", label: L("跟随系统", "System", "Système") }, { value: "light", label: L("浅色", "Light", "Clair") }, { value: "dark", label: L("深色", "Dark", "Sombre") }] },
      { key: "contentDensity", icon: <Ruler className="h-5 w-5" />, label: L("内容密度", "Content density", "Densité du contenu"), options: [{ value: "comfortable", label: L("舒适", "Comfortable", "Confortable") }, { value: "compact", label: L("紧凑", "Compact", "Compact") }] },
    ] },
    { id: "personalization", title: L("个性化", "Personalization", "Personnalisation"), rows: [
      { key: "dateFormat", icon: <Layout className="h-5 w-5" />, label: L("日期格式", "Date format", "Format de date"), options: [{ value: "MMM D, YYYY", label: "Jan 5, 2026" }, { value: "D MMM YYYY", label: "5 Jan 2026" }, { value: "YYYY-MM-DD", label: "2026-01-05" }, { value: "DD/MM/YYYY", label: "05/01/2026" }] },
      { key: "firstDayOfWeek", icon: <Sparkles className="h-5 w-5" />, label: L("每周起始日", "First day of week", "Premier jour de la semaine"), options: [{ value: "monday", label: L("周一", "Monday", "Lundi") }, { value: "sunday", label: L("周日", "Sunday", "Dimanche") }] },
      { key: "messageSort", icon: <MessageSquare className="h-5 w-5" />, label: L("消息排序", "Message sort order", "Tri des messages"), options: [{ value: "newest", label: L("最新在前", "Newest first", "Plus récents d'abord") }, { value: "oldest", label: L("最早在前", "Oldest first", "Plus anciens d'abord") }] },
    ] },
  ]), [L]);

  useEffect(() => {
    if (searchParams?.get("section") === "personalization" || typeof window !== "undefined" && window.location.hash === "#personalization") {
      document.getElementById("personalization")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  if (isLoading || pageLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="mx-auto max-w-5xl px-6 py-16 lg:px-12"><div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div></div>;

  return <div className="mx-auto max-w-5xl space-y-8 px-6 py-12 lg:px-12"><div className="max-w-3xl"><h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{L("偏好设置", "Preferences", "Préférences")}</h1><p className="mt-3 text-sm leading-6 text-neutral-500">{L("更改会立即保存到账户。", "Changes save to your account immediately.", "Les changements sont enregistrés immédiatement sur votre compte.")}</p></div>{sections.map((section) => <div id={section.id} key={section.id} className="overflow-hidden rounded-3xl border border-neutral-200"><div className="border-b border-neutral-100 px-6 py-4"><h2 className="text-base font-semibold text-neutral-900">{section.title}</h2></div><div className="divide-y divide-neutral-100">{section.rows.map((item) => <div key={item.key} className="flex items-center justify-between gap-4 px-6 py-4"><div className="flex items-center gap-3"><span className="text-neutral-600">{item.icon}</span><span className="text-sm font-medium text-neutral-900">{item.label}</span></div><select value={values[item.key as keyof PreferencesState]} onChange={(e) => void save(item.key as keyof PreferencesState, e.target.value)} className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"><option value={values[item.key as keyof PreferencesState]} disabled hidden>{savingKey === item.key ? "Saving…" : undefined}</option>{item.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>)}</div></div>)}</div>;
}

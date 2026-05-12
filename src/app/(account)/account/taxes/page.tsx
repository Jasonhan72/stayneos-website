"use client";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { FileText, Info } from "lucide-react";

export default function TaxesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  if (isLoading) {
    return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  }
  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-12">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">
          {L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12 lg:px-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{L("税务信息", "Tax information", "Informations fiscales")}</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500">{L("税务表单与年度文件会在可用时显示在这里。", "Tax forms and annual documents will appear here when available.", "Les formulaires fiscaux et documents annuels apparaîtront ici lorsqu'ils seront disponibles.")}</p>
      </div>

      <div className="rounded-3xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" />
          <div className="text-sm text-neutral-600">
            <p>
              {L(
                "税务文件将在每年税务季开始时提供（通常为 1 月底前）。您可以在本年税务文件可用时在此下载。",
                "Tax documents are available at the start of each tax season, typically by the end of January. Download them here when available.",
                "Les documents fiscaux sont disponibles au début de la saison des impôts, généralement avant la fin janvier."
              )}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-neutral-400" />
          <p className="text-sm font-medium text-neutral-600">{L("暂无可用税务文件", "No tax documents available yet", "Aucun document fiscal disponible")}</p>
          <p className="mt-1 text-xs text-neutral-500">{L("如果您在 2025 年有收入，2026 年 1 月后将可下载。", "If you earned income in 2025, documents will be downloadable after January 2026.", "Si vous avez eu des revenus en 2025, les documents seront disponibles après janvier 2026.")}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 p-6">
        <h2 className="mb-4 text-base font-semibold text-neutral-900">{L("税务设置", "Tax settings", "Paramètres fiscaux")}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><span className="text-sm text-neutral-700">{L("W-9 表格（美国纳税人）", "W-9 form (US taxpayer)", "Formulaire W-9 (contribuable américain)")}</span><span className="text-xs text-neutral-400">{L("未提供", "Not provided", "Non fourni")}</span></div>
          <div className="flex items-center justify-between"><span className="text-sm text-neutral-700">{L("加拿大 SIN/BN", "Canadian SIN/BN", "NAS/NE canadien")}</span><span className="text-xs text-neutral-400">{L("未提供", "Not provided", "Non fourni")}</span></div>
        </div>
      </div>
    </div>
  );
}

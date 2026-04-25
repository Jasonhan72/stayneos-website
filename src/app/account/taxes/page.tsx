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
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">
        {L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("税务信息", "Tax information", "Informations fiscales")}
        </h2>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
          <div className="text-sm text-neutral-600">
            <p className="mb-2">
              {L(
                "税务文件将在每年税务季开始时提供（通常为 1 月底前）。您可以在本年税务文件可用时在此下载。",
                "Tax documents are available at the start of each tax season (typically by end of January). Download them here when available.",
                "Les documents fiscaux sont disponibles au début de la saison des impôts (généralement fin janvier)."
              )}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
          <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-600">
            {L("暂无可用税务文件", "No tax documents available yet", "Aucun document fiscal disponible")}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {L("如果您在 2025 年有收入，2026 年 1 月后将可下载。", "If you earned income in 2025, documents will be downloadable after January 2026.", "Si vous avez eu des revenus en 2025, les documents seront disponibles après janvier 2026.")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-5">
        <h3 className="text-sm font-medium text-neutral-900 mb-3">
          {L("税务设置", "Tax settings", "Paramètres fiscaux")}
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-neutral-700">
              {L("W-9 表格（美国纳税人）", "W-9 form (US taxpayer)", "Formulaire W-9 (contribuable américain)")}
            </span>
            <span className="text-xs text-neutral-400">
              {L("未提供", "Not provided", "Non fourni")}
            </span>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-neutral-700">
              {L("加拿大 SIN/BN", "Canadian SIN/BN", "NAS/NE canadien")}
            </span>
            <span className="text-xs text-neutral-400">
              {L("未提供", "Not provided", "Non fourni")}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

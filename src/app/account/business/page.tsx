"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Building2, Briefcase, ArrowRight } from "lucide-react";

export default function BusinessPage() {
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("企业账号", "Business account", "Compte professionnel")}
        </h2>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <Building2 className="w-6 h-6 text-neutral-600" />
          <h3 className="text-base font-semibold text-neutral-900">
            {L("企业差旅", "Business travel", "Voyages d'affaires")}
          </h3>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          {L(
            "NEOS 为企业和团队提供定制化长短期住宿方案，包含集中结算、费用管理、员工住宿规划等功能。",
            "NEOS offers tailored short and long-term stays for businesses, including centralized billing, expense management, and accommodation planning.",
            "NEOS propose des solutions sur mesure pour les entreprises : facturation centralisée, gestion des dépenses et planification des hébergements."
          )}
        </p>
        <Link
          href="/for-business"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 underline underline-offset-4"
        >
          {L("了解更多", "Learn more", "En savoir plus")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-300 p-6">
        <div className="flex items-center gap-3 mb-3">
          <Briefcase className="w-6 h-6 text-neutral-400" />
          <h3 className="text-base font-semibold text-neutral-900">
            {L("公司政策", "Company policy", "Politique d'entreprise")}
          </h3>
        </div>
        <p className="text-sm text-neutral-500">
          {L("企业管理员可设置差旅政策、审批流程和预算限制。", "Admins can configure travel policies, approval workflows, and spending limits.", "Les administrateurs peuvent configurer les politiques de voyage et les limites de dépenses.")}
        </p>
      </div>
    </div>
  );
}

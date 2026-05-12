"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Building, Users, CreditCard, ArrowRight } from "lucide-react";

export default function CorporatePage() {
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  const sections = [
    {
      icon: <Building className="w-5 h-5" />,
      title: L("企业账户", "Corporate account", "Compte d'entreprise"),
      desc: L("查看您的企业账户信息、信用额度和优惠条款。", "View your corporate account details, credit limits, and negotiated rates.", "Consultez les détails, limites de crédit et tarifs négociés."),
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: L("团队成员", "Team members", "Membres de l'équipe"),
      desc: L("管理有权使用企业账户预订的员工。", "Manage employees authorized to book under the corporate account.", "Gérez les employés autorisés à réserver."),
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: L("集中结算", "Centralized billing", "Facturation centralisée"),
      desc: L("查看发票历史、报告和结算方式。", "View invoice history, reports, and payment methods.", "Consultez l'historique des factures et les modes de paiement."),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("企业设置", "Corporate settings", "Paramètres d'entreprise")}
        </h2>
      </div>

      <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        {sections.map((s) => (
          <div key={s.title} className="flex items-start gap-4 px-5 py-4">
            <span className="mt-0.5 text-neutral-600 shrink-0">{s.icon}</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-neutral-900">{s.title}</div>
              <div className="mt-0.5 text-sm text-neutral-500">{s.desc}</div>
            </div>
            <span className="text-xs text-neutral-400 mt-1">
              {L("即将推出", "Coming soon", "Bientôt disponible")}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/corporate"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 underline underline-offset-4"
      >
        {L("了解企业住宿方案", "Learn about corporate stays", "En savoir plus sur les séjours d'entreprise")} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

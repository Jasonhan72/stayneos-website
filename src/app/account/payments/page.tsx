"use client";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { CreditCard, Plus, ExternalLink } from "lucide-react";

const DEMO_CARDS = [
  {
    id: "1",
    brand: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2027,
    isDefault: true,
  },
];

export default function PaymentsPage() {
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("支付方式", "Payment methods", "Moyens de paiement")}
        </h2>
      </div>

      <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        {DEMO_CARDS.map((card) => (
          <div key={card.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-neutral-600" />
              <div>
                <div className="text-sm font-medium text-neutral-900">
                  {card.brand} •••• {card.last4}
                </div>
                <div className="text-xs text-neutral-500">
                  {L("有效期至", "Expires", "Expire le")} {card.expMonth}/{card.expYear}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {card.isDefault && (
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                  {L("默认", "Default", "Par défaut")}
                </span>
              )}
              <button className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-900">
                {L("编辑", "Edit", "Modifier")}
              </button>
            </div>
          </div>
        ))}

        <button className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors w-full text-left">
          <Plus className="w-5 h-5 text-neutral-500" />
          {L("添加支付方式", "Add payment method", "Ajouter un moyen de paiement")}
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center gap-3 mb-2">
          <ExternalLink className="w-5 h-5 text-neutral-600" />
          <h3 className="text-sm font-semibold text-neutral-900">
            {L("账单与发票", "Billing & invoices", "Facturation")}
          </h3>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          {L("查看交易记录和下载发票。", "View transaction history and download invoices.", "Consultez l'historique et téléchargez les factures.")}
        </p>
        <button className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors">
          {L("查看账单", "View billing", "Voir la facturation")}
        </button>
      </div>
    </div>
  );
}

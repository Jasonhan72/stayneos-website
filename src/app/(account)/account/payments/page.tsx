"use client";

import { useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { AccountActionLink, AccountRow, AccountSectionCard } from "@/components/account/AccountShell";
import { AccountDesktopShell } from "@/components/account/AccountDesktopShell";

export default function PaymentsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale } = useI18n();
  const L = useCallback((z: string, e: string, f: string) => (locale === "zh" ? z : locale === "fr" ? f : e), [locale]);

  if (isLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="mx-auto max-w-5xl px-6 py-16"><div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div></div>;

  return (
    <AccountDesktopShell title={L("支付", "Payments", "Paiements")} description={L("管理付款方式、礼金和优惠券。", "Manage payment methods, gift credit, and coupons.", "Gérez les moyens de paiement, crédits cadeaux et coupons.")}>
      <div className="space-y-6">
        <AccountSectionCard title={L("付款方式", "Payment methods", "Moyens de paiement")}>
          <AccountRow label={L("信用卡或借记卡", "Credit or debit card", "Carte bancaire")} value={<span className="text-neutral-500">{L("未提供", "Not provided", "Non fourni")}</span>} action={<AccountActionLink>{L("添加", "Add", "Ajouter")}</AccountActionLink>} />
        </AccountSectionCard>
        <AccountSectionCard title={L("礼金与优惠", "Credits and coupons", "Crédits et coupons")}>
          <AccountRow label={L("礼品余额", "Gift credit", "Crédit cadeau")} value="$0.00" />
          <AccountRow label={L("优惠券", "Coupons", "Coupons")} value={<span className="text-neutral-500">{L("暂无可用优惠券", "No coupons available", "Aucun coupon disponible")}</span>} action={<AccountActionLink>{L("添加代码", "Add code", "Ajouter un code")}</AccountActionLink>} />
        </AccountSectionCard>
      </div>
    </AccountDesktopShell>
  );
}

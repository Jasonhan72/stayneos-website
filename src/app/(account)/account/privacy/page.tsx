"use client";

import { useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { AccountActionLink, AccountRow, AccountSectionCard } from "@/components/account/AccountShell";
import { AccountDesktopShell } from "@/components/account/AccountDesktopShell";

export default function PrivacyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale } = useI18n();
  const L = useCallback((z: string, e: string, f: string) => (locale === "zh" ? z : locale === "fr" ? f : e), [locale]);

  if (isLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="mx-auto max-w-5xl px-6 py-16"><div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div></div>;

  return (
    <AccountDesktopShell title={L("隐私", "Privacy", "Confidentialité")} description={L("控制您的数据、分享偏好和账号删除选项。", "Control your data, sharing preferences, and account deletion options.", "Contrôlez vos données, vos préférences de partage et la suppression du compte.")}>
      <div className="space-y-6">
        <AccountSectionCard title={L("分享", "Sharing", "Partage")}>
          <AccountRow label={L("资料显示", "Profile visibility", "Visibilité du profil")} value={L("仅向已确认预订显示必要信息", "Only essential details are shown on confirmed reservations", "Seuls les détails essentiels sont visibles après confirmation")} action={<AccountActionLink>{L("编辑", "Edit", "Modifier")}</AccountActionLink>} />
          <AccountRow label={L("评价显示", "Review visibility", "Visibilité des avis")} value={L("公开", "Public", "Public") } action={<AccountActionLink>{L("编辑", "Edit", "Modifier")}</AccountActionLink>} />
        </AccountSectionCard>
        <AccountSectionCard title={L("数据", "Data", "Données")}>
          <AccountRow label={L("下载个人数据", "Download your data", "Télécharger vos données")} hint={L("导出预订、消息、付款和账号信息。", "Export your reservations, messages, payments, and account information.", "Exportez vos réservations, messages, paiements et informations de compte.")} action={<AccountActionLink>{L("申请", "Request", "Demander")}</AccountActionLink>} />
          <AccountRow label={L("删除账号", "Delete account", "Supprimer le compte")} hint={L("删除后，您的预订记录和个人资料会按政策处理。", "When deleted, your reservation history and profile are handled according to policy.", "Après suppression, votre historique et votre profil sont traités selon la politique.")} action={<AccountActionLink danger>{L("删除", "Delete", "Supprimer")}</AccountActionLink>} />
        </AccountSectionCard>
      </div>
    </AccountDesktopShell>
  );
}

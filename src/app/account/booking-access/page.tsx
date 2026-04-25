"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { KeyRound, Users } from "lucide-react";

export default function BookingAccessPage() {
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) => locale === "zh" ? z : locale === "fr" ? f : e;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">{L("预订权限", "Booking access", "Accès aux réservations")}</h2>
        <p className="mt-1 text-sm text-neutral-500">{L("该功能尚未开放，后续会支持授权预订人和家庭成员代订。", "This feature is coming soon. It will support authorized bookers and family delegation.", "Cette fonctionnalité arrive bientôt. Elle prendra en charge les réservateurs autorisés et la délégation familiale.")}</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center gap-3 mb-4"><Users className="w-5 h-5 text-neutral-600" /><h3 className="text-sm font-semibold text-neutral-900">{L("即将推出", "Coming soon", "Bientôt disponible")}</h3></div>
        <p className="text-sm text-neutral-500">{L("未来这里会提供授权家人、助理或旅行协调人代表您完成预订的能力。", "Soon you'll be able to authorize family members, assistants, or travel coordinators to book on your behalf.", "Bientôt, vous pourrez autoriser des proches, assistants ou coordinateurs de voyage à réserver en votre nom.")}</p>
        <Link href="/account/login-security" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"><KeyRound className="w-4 h-4" />{L('先管理登录安全', 'Manage login security instead', 'Gérer plutôt la sécurité de connexion')}</Link>
      </div>
    </div>
  );
}

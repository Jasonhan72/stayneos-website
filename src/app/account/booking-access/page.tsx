"use client";

import { useI18n } from "@/lib/i18n";
import { KeyRound, Users } from "lucide-react";

export default function BookingAccessPage() {
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("预订权限", "Booking access", "Accès aux réservations")}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          {L("管理谁可以用您的账号进行预订。", "Manage who can book using your account.", "Gérez qui peut réserver avec votre compte.")}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-neutral-600" />
          <h3 className="text-sm font-semibold text-neutral-900">
            {L("家庭及旅行伙伴", "Family & travel companions", "Famille et compagnons de voyage")}
          </h3>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          {L("目前还未添加旅行伙伴。您可以添加家人或朋友，让他们为您或代理进行预订。", "No travel companions added yet. Add family or friends to book on your behalf.", "Aucun compagnon ajouté. Ajoutez des proches pour réserver en votre nom.")}
        </p>
        <button className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors">
          {L("添加旅行伙伴", "Add travel companion", "Ajouter un compagnon")}
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <KeyRound className="w-5 h-5 text-neutral-600" />
          <h3 className="text-sm font-semibold text-neutral-900">
            {L("授权代理预订", "Authorized booking agents", "Agents autorisés")}
          </h3>
        </div>
        <p className="text-sm text-neutral-500">
          {L("企业或代理机构可受信任联系人将您添加为授权预订人。", "Corporate accounts or agencies can add you as an authorized booker.", "Les comptes professionnels peuvent vous ajouter comme réservateur autorisé.")}
        </p>
      </div>
    </div>
  );
}

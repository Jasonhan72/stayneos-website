"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Shield, FileText, Eye, Trash2 } from "lucide-react";

export default function PrivacyPage() {
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  const sections = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: L("隐私政策", "Privacy policy", "Politique de confidentialité"),
      desc: L(
        "了解我们如何收集、使用和保护您的个人信息。",
        "Learn how we collect, use, and protect your personal data.",
        "Découvrez comment nous collectons, utilisons et protégeons vos données."
      ),
      href: "/privacy",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: L("数据使用", "Data usage", "Utilisation des données"),
      desc: L(
        "查看我们如何处理您的使用数据以改善服务。",
        "See how we process your usage data to improve the service.",
        "Voyez comment nous utilisons vos données pour améliorer le service."
      ),
      href: "/privacy#data",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: L("Cookie 偏好", "Cookie preferences", "Préférences de cookies"),
      desc: L(
        "管理网站 Cookie 和跟踪偏好设置。",
        "Manage website cookies and tracking preferences.",
        "Gérez les cookies et les préférences de suivi."
      ),
      href: "/privacy#cookies",
    },
    {
      icon: <Trash2 className="w-5 h-5" />,
      title: L("删除账号", "Delete account", "Supprimer le compte"),
      desc: L(
        "永久删除您的 NEOS 账号及相关数据。此操作不可撤销。",
        "Permanently delete your NEOS account and associated data. This cannot be undone.",
        "Supprimez définitivement votre compte NEOS. Cette action est irréversible."
      ),
      href: "/account/delete-account",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("隐私设置", "Privacy & data", "Confidentialité et données")}
        </h2>
      </div>

      <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        {sections.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="flex items-start gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors"
          >
            <span className="mt-0.5 text-neutral-600 shrink-0">{s.icon}</span>
            <div>
              <div className="text-sm font-medium text-neutral-900">{s.title}</div>
              <div className="mt-0.5 text-sm text-neutral-500">{s.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-neutral-500">
        {L("删除账号需要联系客服确认。", "Account deletion requires contacting support for verification.", "La suppression du compte nécessite une vérification.")}
      </p>
    </div>
  );
}

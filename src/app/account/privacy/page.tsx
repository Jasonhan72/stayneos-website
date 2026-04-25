"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Shield, FileText, Eye, Trash2, Download } from "lucide-react";
import { useAuth } from "@/lib/context/UserContext";
import { useToastHelpers } from "@/components/ui/Toast";

type ExportRequest = { id: string; status: string; fileUrl: string | null; requestedAt: string; completedAt: string | null; expiresAt: string | null; };

export default function PrivacyPage() {
  const { locale } = useI18n();
  const { isAuthenticated } = useAuth();
  const toast = useToastHelpers();
  const [requests, setRequests] = useState<ExportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const L = useCallback((z: string, e: string, f: string) => locale === "zh" ? z : locale === "fr" ? f : e, [locale]);

  const loadRequests = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/account/data-export', { credentials: 'include', cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Failed to load export requests');
      setRequests(payload.requests || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load export requests');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast]);

  useEffect(() => { void loadRequests(); }, [loadRequests]);

  const requestExport = useCallback(async () => {
    setRequesting(true);
    try {
      const response = await fetch('/api/account/data-export', { method: 'POST', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to create export request');
      toast.success(L('导出申请已提交', 'Export request submitted', 'Demande d\'export envoyée'));
      await loadRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create export request');
    } finally {
      setRequesting(false);
    }
  }, [loadRequests, toast, L]);

  const sections = [
    { icon: <FileText className="w-5 h-5" />, title: L("隐私政策", "Privacy policy", "Politique de confidentialité"), desc: L("了解我们如何收集、使用和保护您的个人信息。", "Learn how we collect, use, and protect your personal data.", "Découvrez comment nous collectons, utilisons et protégeons vos données."), href: "/privacy" },
    { icon: <Eye className="w-5 h-5" />, title: L("数据使用", "Data usage", "Utilisation des données"), desc: L("查看我们如何处理您的使用数据以改善服务。", "See how we process your usage data to improve the service.", "Voyez comment nous utilisons vos données pour améliorer le service."), href: "/privacy#data" },
    { icon: <Shield className="w-5 h-5" />, title: L("Cookie 偏好", "Cookie preferences", "Préférences de cookies"), desc: L("管理网站 Cookie 和跟踪偏好设置。", "Manage website cookies and tracking preferences.", "Gérez les cookies et les préférences de suivi."), href: "/privacy#cookies" },
    { icon: <Trash2 className="w-5 h-5" />, title: L("删除账号", "Delete account", "Supprimer le compte"), desc: L("永久删除您的 NEOS 账号及相关数据。此操作不可撤销。", "Permanently delete your NEOS account and associated data. This cannot be undone.", "Supprimez définitivement votre compte NEOS. Cette action est irréversible."), href: "/account/delete-account" },
  ];

  return <div className="space-y-6"><div><h2 className="text-2xl font-semibold text-neutral-900">{L("隐私设置", "Privacy & data", "Confidentialité et données")}</h2></div><div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">{sections.map((s) => <Link key={s.title} href={s.href} className="flex items-start gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors"><span className="mt-0.5 text-neutral-600 shrink-0">{s.icon}</span><div><div className="text-sm font-medium text-neutral-900">{s.title}</div><div className="mt-0.5 text-sm text-neutral-500">{s.desc}</div></div></Link>)}</div>
  <div className="rounded-2xl border border-neutral-200 p-5 space-y-4"><div className="flex items-start gap-3"><Download className="w-5 h-5 text-neutral-600 mt-0.5" /><div><h3 className="text-sm font-semibold text-neutral-900">{L('下载您的数据', 'Download your data', 'Télécharger vos données')}</h3><p className="mt-1 text-sm text-neutral-500">{L('我们会准备一份包含账号数据的导出包。24 小时内只能申请一次。', 'We will prepare an export package with your account data. You can request one every 24 hours.', 'Nous préparerons un export de vos données. Une demande toutes les 24 heures.')}</p></div></div><button onClick={() => void requestExport()} disabled={requesting || !isAuthenticated} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{requesting ? '...' : L('申请导出', 'Request export', 'Demander un export')}</button><div className="rounded-xl border border-neutral-100 bg-neutral-50">{loading ? <div className="px-4 py-4 text-sm text-neutral-500">Loading…</div> : requests.length > 0 ? requests.map((item) => <div key={item.id} className="px-4 py-4 border-b last:border-b-0 border-neutral-100"><div className="text-sm font-medium text-neutral-900">{item.status}</div><div className="mt-1 text-xs text-neutral-500">{new Date(item.requestedAt).toLocaleString()}</div>{item.fileUrl ? <a href={item.fileUrl} className="mt-2 inline-block text-xs text-neutral-500 underline underline-offset-2">{L('下载文件', 'Download file', 'Télécharger le fichier')}</a> : <div className="mt-1 text-xs text-neutral-500">TODO: export worker will generate a downloadable package.</div>}</div>) : <div className="px-4 py-5 text-sm text-neutral-500">{L('还没有导出申请。', 'No export requests yet.', 'Aucune demande d\'export pour le moment.')}</div>}</div></div>
  <p className="text-xs text-neutral-500">{L("删除账号需要联系客服确认。", "Account deletion requires contacting support for verification.", "La suppression du compte nécessite une vérification.")}</p></div>;
}

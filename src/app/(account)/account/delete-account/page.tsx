"use client";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type DeleteStatus = {
  status: 'active' | 'pending_deletion' | 'deleted';
  deletionRequestedAt: string | null;
  deletionScheduledAt: string | null;
  recoverable?: boolean;
  coolingOffDays?: number;
};

export default function DeleteAccountPage() {
  const { locale } = useI18n();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<DeleteStatus>({ status: 'active', deletionRequestedAt: null, deletionScheduledAt: null });
  const L = useCallback((z: string, e: string, f: string) => locale === "zh" ? z : locale === "fr" ? f : e, [locale]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/account/delete-account/status', { credentials: 'include', cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Failed to load delete account status');
      setState(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const requestDeletion = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/account/delete-account', { method: 'POST', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to request deletion');
      setState(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelDeletion = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/account/delete-account/cancel', { method: 'POST', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to cancel deletion');
      setState(payload);
      setConfirmed(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="space-y-6"><div><h2 className="text-2xl font-semibold text-neutral-900">{L("删除账号", "Delete account", "Supprimer le compte")}</h2><p className="mt-2 text-sm text-neutral-500">{L("删除申请提交后会进入 30 天冷静期，期间你可以恢复账号。", "Deletion requests enter a 30-day cooling-off period, and you can still recover the account during that time.", "La suppression entre dans un délai de rétractation de 30 jours, pendant lequel vous pouvez restaurer le compte.")}</p></div><div className="rounded-2xl border border-red-200 bg-red-50 p-5"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" /><div><p className="text-sm font-semibold text-red-900">{L("30 天冷静期", "30-day cooling-off period", "Délai de rétractation de 30 jours")}</p><ul className="mt-2 space-y-1 text-sm text-red-800 list-disc pl-5"><li>{L("提交后账号会标记为待删除。", "Your account will be marked pending deletion.", "Votre compte sera marqué pour suppression.")}</li><li>{L("冷静期内可以在这里取消删除。", "You can cancel the deletion here during the cooling-off period.", "Vous pouvez annuler ici pendant le délai de rétractation.")}</li><li>{L("未结订单需要先处理。", "Open bookings must be resolved first.", "Les réservations en cours doivent être résolues d'abord.")}</li></ul></div></div></div>{loading ? <div className="rounded-2xl border border-neutral-200 p-5 text-sm text-neutral-500">Loading…</div> : state.status === 'pending_deletion' ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-4"><div className="text-sm text-amber-900">{L(`删除申请已提交。计划删除时间：${state.deletionScheduledAt ? new Date(state.deletionScheduledAt).toLocaleString() : '-'}`, `Deletion requested. Scheduled deletion: ${state.deletionScheduledAt ? new Date(state.deletionScheduledAt).toLocaleString() : '-'}`, `Suppression demandée. Suppression prévue : ${state.deletionScheduledAt ? new Date(state.deletionScheduledAt).toLocaleString() : '-'}`)}</div><button disabled={submitting} onClick={cancelDeletion} className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"><RotateCcw className="h-4 w-4" />{L("取消删除", "Cancel deletion", "Annuler la suppression")}</button></div> : <div className="rounded-2xl border border-neutral-200 p-5 space-y-4"><label className="flex items-start gap-3 text-sm text-neutral-700"><input type="checkbox" className="mt-1" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /><span>{L("我理解删除申请提交后会进入 30 天冷静期，且有未完成订单时会被拦截。", "I understand the deletion request enters a 30-day cooling-off period and can be blocked by unresolved bookings.", "Je comprends que la demande entre dans un délai de rétractation de 30 jours et peut être bloquée par des réservations non résolues.")}</span></label><button disabled={!confirmed || submitting} onClick={requestDeletion} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{submitting ? 'Submitting…' : L("提交删除申请", "Submit deletion request", "Soumettre la demande")}</button></div>}<p className="text-xs text-neutral-400">Accounts pending deletion are automatically purged after the 30-day cooling-off period.</p></div>;
}

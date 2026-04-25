"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { CreditCard, Plus, ExternalLink, Trash2, FileText } from "lucide-react";
import { useToastHelpers } from "@/components/ui/Toast";
import StripeProvider from "@/components/payment/StripeProvider";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

type PaymentMethod = { id: string; brand: string; last4: string; expMonth: number | null; expYear: number | null; isDefault: boolean; };
type Invoice = { id: string; amount: number; currency: string; status: string; issuedAt: string; paidAt: string | null; pdfUrl: string | null; bookingId: string | null; };

export default function PaymentsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale } = useI18n();
  const toast = useToastHelpers();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);
  const L = useCallback((z: string, e: string, f: string) => locale === "zh" ? z : locale === "fr" ? f : e, [locale]);

  const fetchPayments = useCallback(async () => {
    setPageLoading(true);
    try {
      const [paymentsResponse, billingResponse] = await Promise.all([
        fetch('/api/account/payments', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/account/billing', { credentials: 'include', cache: 'no-store' }),
      ]);
      const paymentsPayload = await paymentsResponse.json();
      const billingPayload = await billingResponse.json();
      if (!paymentsResponse.ok) throw new Error(paymentsPayload?.error || 'Failed to load payment methods');
      if (!billingResponse.ok) throw new Error(billingPayload?.error || 'Failed to load billing history');
      setPaymentMethods(paymentsPayload.paymentMethods || []);
      setStripeReady(Boolean(paymentsPayload.stripeReady));
      setInvoices(billingPayload.invoices || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load payment settings');
    } finally {
      setPageLoading(false);
    }
  }, [toast]);

  useEffect(() => { if (isAuthenticated) void fetchPayments(); else setPageLoading(false); }, [isAuthenticated, fetchPayments]);

  const startAdd = useCallback(async () => {
    try {
      const response = await fetch('/api/account/payments/setup-intent', { method: 'POST', credentials: 'include' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Failed to start add card flow');
      setClientSecret(payload.clientSecret);
      setShowAddForm(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start add card flow');
    }
  }, [toast]);

  const setDefault = useCallback(async (id: string) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/account/payments/${id}`, { method: 'PATCH', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to update default payment method');
      toast.success(L('默认支付方式已更新', 'Default payment method updated', 'Moyen de paiement par défaut mis à jour'));
      await fetchPayments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update default payment method');
    } finally {
      setBusyId(null);
    }
  }, [fetchPayments, toast, L]);

  const removeMethod = useCallback(async (id: string) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/account/payments/${id}`, { method: 'DELETE', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to remove payment method');
      toast.success(L('支付方式已移除', 'Payment method removed', 'Moyen de paiement supprimé'));
      await fetchPayments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove payment method');
    } finally {
      setBusyId(null);
    }
  }, [fetchPayments, toast, L]);

  const hasMethods = useMemo(() => paymentMethods.length > 0, [paymentMethods]);
  if (isLoading || pageLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div>;

  return (
    <div className="space-y-8">
      <div><h2 className="text-2xl font-semibold text-neutral-900">{L("支付方式", "Payment methods", "Moyens de paiement")}</h2></div>

      <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
        {hasMethods ? paymentMethods.map((card) => (
          <div key={card.id} className="flex items-center justify-between px-5 py-4 gap-3">
            <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-neutral-600" /><div><div className="text-sm font-medium text-neutral-900 capitalize">{card.brand} •••• {card.last4}</div><div className="text-xs text-neutral-500">{L("有效期至", "Expires", "Expire le")} {card.expMonth}/{card.expYear}</div></div></div>
            <div className="flex items-center gap-2 flex-wrap justify-end">{card.isDefault && <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">{L("默认", "Default", "Par défaut")}</span>}{!card.isDefault && <button disabled={busyId === card.id} onClick={() => void setDefault(card.id)} className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-900 disabled:opacity-50">{L("设为默认", "Set default", "Définir par défaut")}</button>}<button disabled={busyId === card.id} onClick={() => void removeMethod(card.id)} className="inline-flex items-center gap-1 text-xs text-red-600 underline underline-offset-2 hover:text-red-700 disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" />{L("移除", "Remove", "Supprimer")}</button></div>
          </div>
        )) : (
          <div className="px-5 py-8 text-center"><p className="text-sm font-medium text-neutral-900">{L("暂无支付方式", "No payment methods yet", "Aucun moyen de paiement")}</p><p className="mt-1 text-sm text-neutral-500">{stripeReady ? L("添加一张卡，用于更快完成预订。", "Add a card for faster checkout.", "Ajoutez une carte pour réserver plus vite.") : L("Stripe 尚未配置，当前仅显示空态。", "Stripe is not configured yet, so this section is currently empty.", "Stripe n'est pas encore configuré, cette section est vide pour le moment.")}</p></div>
        )}

        <button onClick={() => void startAdd()} disabled={!stripeReady} className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors w-full text-left disabled:cursor-not-allowed disabled:text-neutral-400 disabled:hover:bg-white"><Plus className="w-5 h-5 text-neutral-500" />{L("添加支付方式", "Add payment method", "Ajouter un moyen de paiement")}</button>
      </div>

      {showAddForm && clientSecret && (
        <StripeProvider clientSecret={clientSecret}>
          <AddPaymentMethodCard onDone={async () => { setShowAddForm(false); setClientSecret(null); await fetchPayments(); }} onCancel={() => { setShowAddForm(false); setClientSecret(null); }} localeLabel={L} />
        </StripeProvider>
      )}

      <div className="rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center gap-3 mb-2"><FileText className="w-5 h-5 text-neutral-600" /><h3 className="text-sm font-semibold text-neutral-900">{L("账单历史", "Billing history", "Historique de facturation")}</h3></div>
        {invoices.length > 0 ? <div className="divide-y divide-neutral-100">{invoices.map((invoice) => <div key={invoice.id} className="py-4 flex items-center justify-between gap-4"><div><div className="text-sm font-medium text-neutral-900">{invoice.currency} {invoice.amount.toFixed(2)}</div><div className="mt-1 text-xs text-neutral-500">{new Date(invoice.issuedAt).toLocaleDateString()} · {invoice.status}{invoice.bookingId ? ` · Booking ${invoice.bookingId}` : ''}</div></div><div className="flex items-center gap-3">{invoice.pdfUrl ? <a href={invoice.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-900">{L('下载 PDF', 'Download PDF', 'Télécharger le PDF')}</a> : null}<Link href={`/account/billing/${invoice.id}`} className="inline-flex items-center gap-1 text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-900"><ExternalLink className="w-3.5 h-3.5" />{L('查看详情', 'View details', 'Voir les détails')}</Link></div></div>)}</div> : <div><p className="text-sm font-medium text-neutral-900">{L('暂无发票', 'No invoices yet', 'Aucune facture pour le moment')}</p><p className="mt-1 text-sm text-neutral-500">No invoices yet. Invoices will appear here after your first booking.</p></div>}
      </div>
    </div>
  );
}

function AddPaymentMethodCard({ onDone, onCancel, localeLabel }: { onDone: () => Promise<void>; onCancel: () => void; localeLabel: (z: string, e: string, f: string) => string; }) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToastHelpers();
  const [saving, setSaving] = useState(false);
  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements) return;
    setSaving(true);
    try {
      const { error, setupIntent } = await stripe.confirmSetup({ elements, redirect: 'if_required' });
      if (error) throw new Error(error.message || 'Failed to save card');
      const paymentMethodId = typeof setupIntent?.payment_method === 'string' ? setupIntent.payment_method : null;
      if (!paymentMethodId) throw new Error('Missing payment method id');
      const response = await fetch('/api/account/payments', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentMethodId }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to attach payment method');
      toast.success(localeLabel('支付方式已添加', 'Payment method added', 'Moyen de paiement ajouté'));
      await onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add payment method');
    } finally { setSaving(false); }
  }, [stripe, elements, toast, onDone, localeLabel]);
  return <div className="rounded-2xl border border-neutral-200 p-5 space-y-4"><h3 className="text-sm font-semibold text-neutral-900">{localeLabel('添加支付方式', 'Add payment method', 'Ajouter un moyen de paiement')}</h3><PaymentElement /><div className="flex gap-3"><button onClick={() => void handleSubmit()} disabled={saving || !stripe || !elements} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : localeLabel('保存卡片', 'Save card', 'Enregistrer la carte')}</button><button onClick={onCancel} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900">{localeLabel('取消', 'Cancel', 'Annuler')}</button></div></div>;
}

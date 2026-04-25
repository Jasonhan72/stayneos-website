"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { useToastHelpers } from "@/components/ui/Toast";

type Address = {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type FormState = {
  label: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const EMPTY_FORM: FormState = { label: '', line1: '', line2: '', city: '', region: '', postalCode: '', country: 'CA', isDefault: false };

export default function AddressesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale } = useI18n();
  const toast = useToastHelpers();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const L = useCallback((z: string, e: string, f: string) => locale === "zh" ? z : locale === "fr" ? f : e, [locale]);

  const fetchAddresses = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await fetch('/api/account/addresses', { credentials: 'include', cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Failed to load addresses');
      setAddresses(payload.addresses || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load addresses');
    } finally {
      setPageLoading(false);
    }
  }, [toast]);

  useEffect(() => { if (isAuthenticated) void fetchAddresses(); else setPageLoading(false); }, [isAuthenticated, fetchAddresses]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
  }, [addresses.length]);

  useEffect(() => { resetForm(); }, [resetForm]);

  const submit = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch(editingId ? `/api/account/addresses/${editingId}` : '/api/account/addresses', {
        method: editingId ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to save address');
      toast.success(editingId ? L('地址已更新', 'Address updated', 'Adresse mise à jour') : L('地址已添加', 'Address added', 'Adresse ajoutée'));
      resetForm();
      await fetchAddresses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  }, [editingId, fetchAddresses, form, resetForm, toast, L]);

  const removeAddress = useCallback(async (id: string) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to remove address');
      toast.success(L('地址已删除', 'Address removed', 'Adresse supprimée'));
      await fetchAddresses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove address');
    } finally {
      setBusyId(null);
    }
  }, [fetchAddresses, toast, L]);

  const setDefault = useCallback(async (id: string) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/account/addresses/${id}/default`, { method: 'POST', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Failed to set default address');
      toast.success(L('默认地址已更新', 'Default address updated', 'Adresse par défaut mise à jour'));
      await fetchAddresses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to set default address');
    } finally {
      setBusyId(null);
    }
  }, [fetchAddresses, toast, L]);

  const startEdit = useCallback((address: Address) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
  }, []);

  const hasAddresses = useMemo(() => addresses.length > 0, [addresses]);
  if (isLoading || pageLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div>;

  return <div className="space-y-6"><div><h2 className="text-2xl font-semibold text-neutral-900">{L("地址", "Addresses", "Adresses")}</h2><p className="mt-2 text-sm text-neutral-500">{L("用于发票、身份验证及商务资料。", "Used for billing, identity verification, and business details.", "Utilisé pour la facturation et la vérification.")}</p></div>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
        {hasAddresses ? addresses.map((address) => <div key={address.id} className="px-5 py-4 flex items-start justify-between gap-4"><div className="flex gap-3"><MapPin className="w-5 h-5 text-neutral-500 mt-0.5" /><div><div className="flex items-center gap-2"><div className="text-sm font-medium text-neutral-900">{address.label}</div>{address.isDefault && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">{L('默认', 'Default', 'Par défaut')}</span>}</div><div className="mt-1 text-sm text-neutral-500">{[address.line1, address.line2, `${address.city}, ${address.region} ${address.postalCode}`, address.country].filter(Boolean).join(', ')}</div></div></div><div className="flex items-center gap-3 shrink-0">{!address.isDefault && <button disabled={busyId === address.id} onClick={() => void setDefault(address.id)} className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-900 disabled:opacity-50 inline-flex items-center gap-1"><Star className="w-3.5 h-3.5" />{L('设为默认', 'Set default', 'Définir par défaut')}</button>}<button onClick={() => startEdit(address)} className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-900 inline-flex items-center gap-1"><Pencil className="w-3.5 h-3.5" />{L('编辑', 'Edit', 'Modifier')}</button><button disabled={busyId === address.id} onClick={() => void removeAddress(address.id)} className="text-xs text-red-600 underline underline-offset-2 hover:text-red-700 disabled:opacity-50 inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />{L('删除', 'Delete', 'Supprimer')}</button></div></div>) : <div className="px-5 py-10 text-center"><p className="text-sm font-medium text-neutral-900">{L('暂无地址', 'No saved addresses yet', 'Aucune adresse enregistrée')}</p><p className="mt-1 text-sm text-neutral-500">{L('添加地址后，结账和发票信息会更快填写。', 'Add an address to speed up billing and checkout.', 'Ajoutez une adresse pour accélérer la facturation.')}</p></div>}
      </div>
      <div className="rounded-2xl border border-neutral-200 p-5 space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-neutral-900">{editingId ? L('编辑地址', 'Edit address', 'Modifier l\'adresse') : L('新增地址', 'Add address', 'Ajouter une adresse')}</h3>{editingId ? <button onClick={resetForm} className="text-xs text-neutral-500 underline underline-offset-2">{L('取消', 'Cancel', 'Annuler')}</button> : <Plus className="w-4 h-4 text-neutral-500" />}</div>
        <div className="grid gap-3">{[
          ['label', L('标签', 'Label', 'Libellé')],
          ['line1', L('地址第一行', 'Address line 1', 'Adresse ligne 1')],
          ['line2', L('地址第二行', 'Address line 2', 'Adresse ligne 2')],
          ['city', L('城市', 'City', 'Ville')],
          ['region', L('省 / 州', 'Province / state', 'Province / état')],
          ['postalCode', L('邮编', 'Postal code', 'Code postal')],
          ['country', L('国家', 'Country', 'Pays')],
        ].map(([key, label]) => <input key={key} value={form[key as keyof FormState] as string} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={label} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" />)}
          <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))} />{L('设为默认地址', 'Set as default address', 'Définir comme adresse par défaut')}</label>
          <button disabled={saving} onClick={() => void submit()} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : editingId ? L('保存更改', 'Save changes', 'Enregistrer') : L('添加地址', 'Add address', 'Ajouter')}</button>
        </div>
      </div>
    </div>
  </div>;
}

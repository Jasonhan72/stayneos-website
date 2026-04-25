"use client";
import { useCallback, useState } from "react";
import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { useToastHelpers } from "@/components/ui/Toast";
export default function AddressesPage() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const { locale } = useI18n();
  const toast = useToastHelpers();
  const [value, setValue] = useState(user?.address || "");
  const [saving, setSaving] = useState(false);
  const L = useCallback((z: string, e: string, f: string) => locale === "zh" ? z : locale === "fr" ? f : e, [locale]);
  if (isLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div>;
  return <div className="space-y-6"><div><h2 className="text-2xl font-semibold text-neutral-900">{L("地址", "Addresses", "Adresses")}</h2><p className="mt-2 text-sm text-neutral-500">{L("用于发票、身份验证及商务资料。", "Used for invoicing, identity verification, and business details.", "Utilisé pour la facturation et la vérification.")}</p></div><div className="rounded-2xl border border-neutral-200 p-5 space-y-4"><div className="flex items-center gap-3 text-sm font-medium text-neutral-900"><MapPin className="w-5 h-5 text-neutral-500" />{L("主要地址", "Primary address", "Adresse principale")}</div><textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" placeholder={L("填写完整街道地址", "Enter your full street address", "Saisissez votre adresse complète")} /><button disabled={saving} onClick={async () => { setSaving(true); try { await updateProfile({ address: value.trim() }); toast.success(L("地址已保存", "Address saved", "Adresse enregistrée")); } catch (error) { toast.error(error instanceof Error ? error.message : 'Save failed'); } finally { setSaving(false); } }} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : L("保存地址", "Save address", "Enregistrer l'adresse")}</button></div></div>;
}

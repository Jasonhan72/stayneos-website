"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Mail, Smartphone } from "lucide-react";
import { useToastHelpers } from "@/components/ui/Toast";

type ToggleKey = "bookingConfirmations" | "bookingReminders" | "specialOffers" | "newsletter" | "hostPayouts" | "hostNewInquiries" | "productUpdates" | "smsBookingUpdates" | "smsPromotions";
type ToggleGroup = "email" | "sms";
type ToggleDef = { key: ToggleKey; labelZh: string; labelEn: string; labelFr: string; group: ToggleGroup; descZh: string; descEn: string; descFr: string };

const ALL_TOGGLES: ToggleDef[] = [
  { key: "bookingConfirmations", labelZh: "预订确认", labelEn: "Booking confirmations", labelFr: "Confirmations de réservation", group: "email", descZh: "当您的预订成功时发送邮件。", descEn: "Sent when a booking is confirmed.", descFr: "Envoyé lors de la confirmation." },
  { key: "bookingReminders", labelZh: "预订提醒", labelEn: "Booking reminders", labelFr: "Rappels de réservation", group: "email", descZh: "入住前发送提醒。", descEn: "Reminders before check-in.", descFr: "Rappels avant l'arrivée." },
  { key: "specialOffers", labelZh: "优惠活动", labelEn: "Special offers", labelFr: "Offres spéciales", group: "email", descZh: "限时优惠和折扣信息。", descEn: "Limited-time deals and discounts.", descFr: "Offres et réductions limitées." },
  { key: "newsletter", labelZh: "邮件通讯", labelEn: "Newsletter", labelFr: "Infolettre", group: "email", descZh: "NEOS 市场动态和社区新闻。", descEn: "NEOS market insights and community news.", descFr: "Actualités et tendances NEOS." },
  { key: "hostPayouts", labelZh: "房东收款", labelEn: "Host payouts", labelFr: "Paiements hôtes", group: "email", descZh: "每次收款记录和结算通知。", descEn: "Payout confirmations and summaries.", descFr: "Confirmations et résumés de paiement." },
  { key: "hostNewInquiries", labelZh: "新咨询", labelEn: "New inquiries", labelFr: "Nouvelles demandes", group: "email", descZh: "有潜在客户咨询您的房源。", descEn: "Someone inquires about your property.", descFr: "Quelqu'un s'intéresse à votre bien." },
  { key: "productUpdates", labelZh: "产品更新", labelEn: "Product updates", labelFr: "Mises à jour produit", group: "email", descZh: "新功能和功能改进通知。", descEn: "New features and improvements.", descFr: "Nouvelles fonctionnalités." },
  { key: "smsBookingUpdates", labelZh: "短信预订更新", labelEn: "SMS booking updates", labelFr: "Mises à jour par SMS", group: "sms", descZh: "通过短信接收预订状态变更。", descEn: "Booking status changes via SMS.", descFr: "Changements de statut par SMS." },
  { key: "smsPromotions", labelZh: "短信促销", labelEn: "SMS promotions", labelFr: "Promotions par SMS", group: "sms", descZh: "通过短信接收精选优惠。", descEn: "Curated offers via SMS.", descFr: "Offres sélectionnées par SMS." },
];

const DEFAULT_TOGGLES: Record<ToggleKey, boolean> = { bookingConfirmations: true, bookingReminders: true, specialOffers: false, newsletter: true, hostPayouts: true, hostNewInquiries: true, productUpdates: true, smsBookingUpdates: false, smsPromotions: false };

export default function NotificationsPage() {
  const { locale } = useI18n();
  const toast = useToastHelpers();
  const L = useCallback((z: string, e: string, f: string) => locale === "zh" ? z : locale === "fr" ? f : e, [locale]);
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>(DEFAULT_TOGGLES);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<ToggleKey | null>(null);

  useEffect(() => { void (async () => { try { const response = await fetch('/api/account/notifications', { credentials: 'include', cache: 'no-store' }); const payload = await response.json(); if (!response.ok) throw new Error(payload?.error || 'Failed to load notifications'); setToggles(payload.preferences || DEFAULT_TOGGLES); } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to load notifications'); } finally { setLoading(false); } })(); }, [toast]);

  const persist = useCallback(async (next: Record<ToggleKey, boolean>, key: ToggleKey) => { setSavingKey(key); try { const response = await fetch('/api/account/notifications', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload?.error || 'Failed to save notifications'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to save notifications'); throw error; } finally { setSavingKey(null); } }, [toast]);

  const toggle = useCallback((key: ToggleKey) => { const prev = toggles; const next = { ...prev, [key]: !prev[key] }; setToggles(next); void persist(next, key).catch(() => setToggles(prev)); }, [toggles, persist]);

  const emailToggles = useMemo(() => ALL_TOGGLES.filter((t) => t.group === "email"), []);
  const smsToggles = useMemo(() => ALL_TOGGLES.filter((t) => t.group === "sms"), []);
  if (loading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;

  return <div className="space-y-8"><div><h2 className="text-2xl font-semibold text-neutral-900">{L("通知设置", "Notifications", "Notifications")}</h2></div><Section icon={<Mail className="w-5 h-5" />} title={L("邮件通知", "Email notifications", "Notifications par e-mail")}><div className="divide-y divide-neutral-100">{emailToggles.map((item) => <div key={item.key} className="flex items-center justify-between py-3 gap-4"><div><div className="text-sm font-medium text-neutral-900">{L(item.labelZh, item.labelEn, item.labelFr)}</div><div className="text-xs text-neutral-500">{L(item.descZh, item.descEn, item.descFr)}</div></div><ToggleSwitch checked={toggles[item.key]} onChange={() => toggle(item.key)} disabled={savingKey === item.key} /></div>)}</div></Section><Section icon={<Smartphone className="w-5 h-5" />} title={L("短信通知", "SMS notifications", "Notifications par SMS")}><div className="divide-y divide-neutral-100">{smsToggles.map((item) => <div key={item.key} className="flex items-center justify-between py-3 gap-4"><div><div className="text-sm font-medium text-neutral-900">{L(item.labelZh, item.labelEn, item.labelFr)}</div><div className="text-xs text-neutral-500">{L(item.descZh, item.descEn, item.descFr)}</div></div><ToggleSwitch checked={toggles[item.key]} onChange={() => toggle(item.key)} disabled={savingKey === item.key} /></div>)}</div></Section></div>;
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) { return <div className="rounded-2xl border border-neutral-200 p-5"><div className="flex items-center gap-3 mb-2"><span className="text-neutral-600">{icon}</span><h3 className="text-sm font-semibold text-neutral-900">{title}</h3></div>{children}</div>; }
function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) { return <button type="button" disabled={disabled} onClick={onChange} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-neutral-900" : "bg-neutral-200"} ${disabled ? 'opacity-50' : ''}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} /></button>; }

"use client";

import { useCallback, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { AccountSectionCard } from "@/components/account/AccountShell";
import { AccountDesktopShell } from "@/components/account/AccountDesktopShell";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" onClick={() => onChange(!checked)} className={cn("relative h-7 w-12 rounded-full transition", checked ? "bg-neutral-950" : "bg-neutral-300")}><span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white transition", checked ? "left-6" : "left-1")} /></button>;
}

export default function NotificationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale } = useI18n();
  const L = useCallback((z: string, e: string, f: string) => (locale === "zh" ? z : locale === "fr" ? f : e), [locale]);
  const sections = useMemo(() => [
    { title: L("行前规划", "Trip planning", "Préparation du voyage"), rows: [L("收藏与价格变动", "Wishlists and price changes", "Favoris et changements de prix"), L("目的地灵感", "Destination inspiration", "Inspirations de destination")] },
    { title: L("订单", "Bookings", "Réservations"), rows: [L("预订确认", "Booking confirmations", "Confirmations de réservation"), L("入住提醒", "Check-in reminders", "Rappels d’arrivée"), L("行程变更", "Reservation changes", "Modifications de réservation")] },
    { title: L("评价", "Reviews", "Avis"), rows: [L("撰写评价提醒", "Review reminders", "Rappels d’avis")] },
    { title: L("优惠活动", "Promotions", "Promotions"), rows: [L("新品与活动", "New offers and campaigns", "Nouvelles offres et campagnes")] },
  ], [L]);
  const [state, setState] = useState<Record<string, { email: boolean; sms: boolean; push: boolean }>>({});

  if (isLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="mx-auto max-w-5xl px-6 py-16"><div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div></div>;

  return (
    <AccountDesktopShell title={L("通知", "Notifications", "Notifications")} description={L("选择通过邮件、短信或推送接收哪些消息。", "Choose which updates you receive by email, SMS, or push.", "Choisissez les mises à jour à recevoir par e-mail, SMS ou push.")}>
      <AccountSectionCard title={L("通知偏好", "Notification preferences", "Préférences de notification")}>
        <div className="hidden grid-cols-[minmax(0,1fr)_96px_96px_96px] border-b border-neutral-200 px-6 py-4 text-sm font-medium text-neutral-500 md:grid">
          <div></div><div>Email</div><div>SMS</div><div>Push</div>
        </div>
        <div className="divide-y divide-neutral-200">
          {sections.map((section) => (
            <div key={section.title} className="px-6 py-6">
              <h3 className="text-base font-semibold text-neutral-950">{section.title}</h3>
              <div className="mt-4 space-y-4">
                {section.rows.map((row) => {
                  const key = `${section.title}-${row}`;
                  const value = state[key] || { email: true, sms: false, push: true };
                  return (
                    <div key={row} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_96px_96px_96px] md:items-center">
                      <div className="text-sm text-neutral-900">{row}</div>
                      <Toggle checked={value.email} onChange={(v)=>setState((s)=>({...s,[key]:{...value,email:v}}))} />
                      <Toggle checked={value.sms} onChange={(v)=>setState((s)=>({...s,[key]:{...value,sms:v}}))} />
                      <Toggle checked={value.push} onChange={(v)=>setState((s)=>({...s,[key]:{...value,push:v}}))} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </AccountSectionCard>
    </AccountDesktopShell>
  );
}

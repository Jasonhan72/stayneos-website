"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { CalendarDays, Home, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiConversation } from "@/types/api/messages";

function fmtDate(iso?: string) { if (!iso) return "—"; return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function fmtMoney(n?: number, currency = "CAD") { if (typeof n !== "number") return "—"; return new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 0 }).format(n); }

export default function BookingCard({ conversation, visible, onClose, t }: { conversation: ApiConversation; visible: boolean; onClose: () => void; t: (k: string, d: string) => string; }) {
  return <>
    <aside className={cn("hidden border-l border-neutral-200 bg-white transition-all duration-200 xl:block", visible ? "w-[360px]" : "w-0 overflow-hidden border-l-0")}><div className={cn("w-[360px]", !visible && "hidden")}><Content conversation={conversation} t={t} /></div></aside>
    <div className={cn("fixed inset-0 z-50 xl:hidden", visible ? "pointer-events-auto" : "pointer-events-none")}><div onClick={onClose} className={cn("absolute inset-0 bg-black/40 transition-opacity", visible ? "opacity-100" : "opacity-0")} /><div className={cn("absolute bottom-0 left-0 right-0 max-h-[86vh] overflow-y-auto rounded-t-[28px] bg-white shadow-2xl transition-transform", visible ? "translate-y-0" : "translate-y-full")}><div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4"><h3 className="text-lg font-semibold">Reservation details</h3><button onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100"><X className="h-5 w-5" /></button></div><Content conversation={conversation} t={t} /></div></div>
  </>;
}

function Content({ conversation, t }: { conversation: ApiConversation; t: (k: string, d: string) => string }) {
  const property = conversation.property;
  const booking = conversation.booking;
  return <div className="p-5">
    <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-neutral-100">{property?.imageUrl ? <img src={property.imageUrl} alt={property.title} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Home className="h-12 w-12 text-neutral-300" /></div>}</div>
      <div className="p-4"><h3 className="text-lg font-semibold leading-tight text-neutral-950">{property?.title || "StayNeos home"}</h3><p className="mt-1 text-sm text-neutral-500">{property?.address || "Toronto"}</p>{property?.bedrooms || property?.bathrooms ? <p className="mt-2 text-xs font-medium text-neutral-500">{property.bedrooms ?? "—"} bed · {property.bathrooms ?? "—"} bath</p> : null}</div>
    </div>
    <div className="mt-5 rounded-[28px] border border-neutral-200 p-5"><div className="mb-4 flex items-center justify-between"><h4 className="font-semibold text-neutral-950">Trip details</h4>{booking?.status ? <span className="rounded-full bg-[#00A699]/10 px-3 py-1 text-xs font-bold text-[#008A7A]">{booking.status}</span> : null}</div><div className="space-y-4 text-sm"><Row icon={<CalendarDays className="h-4 w-4" />} label="Check-in" value={fmtDate(booking?.checkIn)} /><Row icon={<CalendarDays className="h-4 w-4" />} label="Check-out" value={fmtDate(booking?.checkOut)} /><Row icon={<Users className="h-4 w-4" />} label="Guests" value={booking ? `${booking.guests} guest${booking.guests === 1 ? "" : "s"}` : "—"} /></div>{booking ? <div className="mt-5 border-t border-neutral-100 pt-4"><div className="flex items-center justify-between"><span className="text-sm font-medium text-neutral-500">Total</span><span className="font-semibold text-neutral-950">{fmtMoney(booking.totalPrice, booking.currency)}</span></div></div> : null}</div>
    {booking ? <Link href={`/dashboard/bookings/${booking.id}`} className="mt-5 flex w-full items-center justify-center rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-bold text-white hover:bg-neutral-800">{t("messages.viewReservation", "View reservation details")}</Link> : <button disabled className="mt-5 w-full rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-400">No booking attached</button>}
  </div>;
}
function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-2 text-neutral-500">{icon}<span>{label}</span></div><span className="font-semibold text-neutral-950">{value}</span></div>; }

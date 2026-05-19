"use client";

import { useEffect, useMemo, useState } from "react";
import { formatYmd } from "@/lib/host-date";
import { useUser } from "@/lib/context/UserContext";

type Reservation = {
  id: string;
  guestName: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  status: string;
  amount: number;
};

type Stats = {
  metrics: { checkInsToday: number; checkOutsToday: number; revenueThisMonth: number; occupancyRate: number };
  arrivingGuests: Reservation[];
  upcomingReservations: Reservation[];
};

export default function TodayDashboard() {
  const { user } = useUser();
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/host/dashboard-stats', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const cards = useMemo(() => [
    { label: "Today's check-ins", value: data?.metrics?.checkInsToday ?? 0 },
    { label: "Today's check-outs", value: data?.metrics?.checkOutsToday ?? 0 },
    { label: "This month's revenue", value: `$${(data?.metrics?.revenueThisMonth ?? 0).toLocaleString()} CAD` },
    { label: "Occupancy rate", value: `${data?.metrics?.occupancyRate ?? 0}%` },
  ], [data]);

  const renderList = (items: Reservation[], empty: string) => items.length ? (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-200 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-medium text-neutral-900">{item.guestName || 'Guest'} · {item.propertyTitle}</div>
            <div className="text-sm text-neutral-500">{item.checkIn} → {item.checkOut}</div>
          </div>
          <div className="text-sm text-neutral-600">{item.status} · ${item.amount.toLocaleString()} CAD</div>
        </div>
      ))}
    </div>
  ) : <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-sm text-neutral-500">{empty}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">Welcome back, {user?.firstName || user?.name || 'Host'}</h1>
        <p className="mt-2 text-neutral-500">{formatYmd(new Date())}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-neutral-500">{card.label}</div>
            <div className="mt-3 text-2xl font-semibold text-neutral-900">{loading ? '—' : card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Arriving guests</h2>
          <div className="mt-4">{renderList(data?.arrivingGuests || [], 'No arrivals scheduled for today.')}</div>
        </section>
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Upcoming reservations</h2>
          <div className="mt-4">{renderList(data?.upcomingReservations || [], 'No upcoming reservations in the next 7 days.')}</div>
        </section>
      </div>
    </div>
  );
}

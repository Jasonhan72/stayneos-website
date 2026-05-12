"use client";

import { useEffect, useMemo, useState } from "react";

type Monthly = { month: string; gross: number; nights: number; bookings: number };
type Property = { propertyId: string; propertyTitle: string; gross: number; nights: number; bookings: number };
type EarningsResponse = {
  currency: string;
  months: number;
  totals: { gross: number; bookings: number; nights: number; averageNightly: number };
  monthly: Monthly[];
  byProperty: Property[];
};

const RANGE_OPTIONS = [
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
  { label: "Last 12 months", months: 12 },
];

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function formatMonth(monthKey: string) {
  const [y, m] = monthKey.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

export default function EarningsClient() {
  const [months, setMonths] = useState(12);
  const [data, setData] = useState<EarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/host/earnings?months=${months}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json() as Promise<EarningsResponse>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load earnings");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [months]);

  const chartMax = useMemo(() => {
    if (!data?.monthly?.length) return 0;
    return Math.max(1, ...data.monthly.map((m) => m.gross));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Earnings</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gross revenue from confirmed bookings across your properties. Net
            payouts and tax documents live under Account &rarr; Taxes.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.months}
              onClick={() => setMonths(opt.months)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                months === opt.months
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn&apos;t load earnings: {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Gross revenue"
          value={data ? formatCurrency(data.totals.gross, data.currency) : "—"}
          loading={loading}
        />
        <StatCard
          label="Bookings"
          value={data ? String(data.totals.bookings) : "—"}
          loading={loading}
        />
        <StatCard
          label="Nights booked"
          value={data ? String(data.totals.nights) : "—"}
          loading={loading}
        />
        <StatCard
          label="Avg nightly"
          value={data ? formatCurrency(data.totals.averageNightly, data.currency) : "—"}
          loading={loading}
        />
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">Monthly revenue</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Based on booking check-in date.
        </p>
        <div className="mt-6 space-y-3">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 animate-pulse rounded-full bg-neutral-100" />
              ))}
            </div>
          )}
          {!loading &&
            data?.monthly?.map((m) => (
              <div key={m.month} className="flex items-center gap-4">
                <div className="w-24 shrink-0 text-sm text-neutral-600">{formatMonth(m.month)}</div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-neutral-900"
                    style={{ width: `${chartMax > 0 ? (m.gross / chartMax) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-32 shrink-0 text-right text-sm font-medium text-neutral-900">
                  {formatCurrency(m.gross, data.currency)}
                </div>
              </div>
            ))}
          {!loading && data && data.monthly.length === 0 && (
            <p className="text-sm text-neutral-500">No revenue data in this range yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">By property</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-2">Property</th>
                <th className="py-2 text-right">Bookings</th>
                <th className="py-2 text-right">Nights</th>
                <th className="py-2 text-right">Gross</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {!loading &&
                data?.byProperty?.map((p) => (
                  <tr key={p.propertyId}>
                    <td className="py-3 pr-4 text-neutral-900">{p.propertyTitle}</td>
                    <td className="py-3 text-right text-neutral-700">{p.bookings}</td>
                    <td className="py-3 text-right text-neutral-700">{p.nights}</td>
                    <td className="py-3 text-right font-medium text-neutral-900">
                      {formatCurrency(p.gross, data.currency)}
                    </td>
                  </tr>
                ))}
              {!loading && data && data.byProperty.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-neutral-500">
                    No property revenue in this range yet.
                  </td>
                </tr>
              )}
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="py-3">
                      <div className="h-5 animate-pulse rounded bg-neutral-100" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">
        {loading ? <span className="inline-block h-7 w-28 animate-pulse rounded bg-neutral-100" /> : value}
      </div>
    </div>
  );
}

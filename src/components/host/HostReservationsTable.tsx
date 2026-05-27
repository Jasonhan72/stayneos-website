"use client";

import useSWR from "swr";
import { useI18n } from "@/lib/i18n";

type Reservation = {
  id: string;
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  status: string;
  amount: number;
};

type ReservationsResponse = {
  reservations?: Reservation[];
};

const fetcher = (url: string): Promise<ReservationsResponse> =>
  fetch(url, { credentials: 'include', cache: 'no-store' }).then((r) => r.json());

export default function HostReservationsTable() {
  const { t } = useI18n();
  const { data, isLoading } = useSWR<ReservationsResponse>(
    '/api/host/reservations',
    fetcher,
    { revalidateOnFocus: false }
  );
  const rows = data?.reservations ?? [];

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-200 px-6 py-5">
        <h1 className="text-2xl font-semibold text-neutral-900">{t("host.reservations.title", "Reservations")}</h1>
      </div>
      <div className="divide-y divide-neutral-100 md:hidden">
        {isLoading ? (
          <div className="px-5 py-8 text-sm text-neutral-500">{t("common.loading", "Loading...")}</div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-8 text-sm text-neutral-500">{t("host.reservations.empty", "No reservations found.")}</div>
        ) : rows.map((row) => (
          <article key={row.id} className="space-y-3 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-neutral-900">{row.guestName || t("host.reservations.guestFallback", "Guest")}</h2>
                <p className="truncate text-sm text-neutral-500">{row.guestEmail}</p>
              </div>
              <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">{row.status}</span>
            </div>
            <p className="text-sm font-medium text-neutral-800">{row.propertyTitle}</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-400">{t("host.reservations.checkIn", "Check-in")}</dt>
                <dd className="mt-1 text-neutral-700">{row.checkIn}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-400">{t("host.reservations.checkOut", "Check-out")}</dt>
                <dd className="mt-1 text-neutral-700">{row.checkOut}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-wide text-neutral-400">{t("host.reservations.amount", "Amount")}</dt>
                <dd className="mt-1 font-semibold text-neutral-900">${row.amount.toLocaleString()} CAD</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-6 py-3 font-medium">{t("host.reservations.guest", "Guest")}</th>
              <th className="px-6 py-3 font-medium">{t("host.reservations.property", "Property")}</th>
              <th className="px-6 py-3 font-medium">{t("host.reservations.checkIn", "Check-in")}</th>
              <th className="px-6 py-3 font-medium">{t("host.reservations.checkOut", "Check-out")}</th>
              <th className="px-6 py-3 font-medium">{t("host.reservations.status", "Status")}</th>
              <th className="px-6 py-3 font-medium">{t("host.reservations.amount", "Amount")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-6 py-8 text-neutral-500" colSpan={6}>{t("common.loading", "Loading...")}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-6 py-8 text-neutral-500" colSpan={6}>{t("host.reservations.empty", "No reservations found.")}</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id} className="border-t border-neutral-100">
                <td className="px-6 py-4">
                  <div className="font-medium text-neutral-900">{row.guestName || t("host.reservations.guestFallback", "Guest")}</div>
                  <div className="text-neutral-500">{row.guestEmail}</div>
                </td>
                <td className="px-6 py-4 text-neutral-700">{row.propertyTitle}</td>
                <td className="px-6 py-4 text-neutral-700">{row.checkIn}</td>
                <td className="px-6 py-4 text-neutral-700">{row.checkOut}</td>
                <td className="px-6 py-4"><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">{row.status}</span></td>
                <td className="px-6 py-4 text-neutral-900">${row.amount.toLocaleString()} CAD</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

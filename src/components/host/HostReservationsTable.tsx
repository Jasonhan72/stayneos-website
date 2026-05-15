"use client";

import useSWR from "swr";

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
  const { data, isLoading } = useSWR<ReservationsResponse>(
    '/api/host/reservations',
    fetcher,
    { revalidateOnFocus: false }
  );
  const rows = data?.reservations ?? [];

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-200 px-6 py-5">
        <h1 className="text-2xl font-semibold text-neutral-900">Reservations</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-6 py-3 font-medium">Guest</th>
              <th className="px-6 py-3 font-medium">Property</th>
              <th className="px-6 py-3 font-medium">Check-in</th>
              <th className="px-6 py-3 font-medium">Check-out</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-6 py-8 text-neutral-500" colSpan={6}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-6 py-8 text-neutral-500" colSpan={6}>No reservations found.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id} className="border-t border-neutral-100">
                <td className="px-6 py-4">
                  <div className="font-medium text-neutral-900">{row.guestName || 'Guest'}</div>
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addDaysYmd, diffDays, eachDay, formatYmd, toDate } from "@/lib/host-date";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { availableCellClassName, blockedCellClassName, bookedCellClassName } from "@/components/host/calendar-styles";
import { cn } from "@/lib/utils";

type Property = { id: string; title: string; basePrice?: number };
type Day = { date: string; propertyId: string; status: string; price: number | null; isBooked: boolean; bookingId?: string };

function toMoney(value?: number | null) { return value == null ? '—' : `$${Math.round(value / 100)}`; }

export default function HostCalendar() {
  const [data, setData] = useState<{ properties: Property[]; days: Day[] }>({ properties: [], days: [] });
  const [selectedPropertyId, setSelectedPropertyId] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selection, setSelection] = useState<{ propertyId: string; start: string; end: string } | null>(null);
  const [draft, setDraft] = useState({ status: 'blocked', price: '', minNights: '', notes: '' });
  const [monthOffset, setMonthOffset] = useState(0);
  const today = toDate(new Date())!;
  today.setHours(0,0,0,0);
  const start = addDaysYmd(today, monthOffset * 30);
  const end = addDaysYmd(start, 59);

  const load = useCallback(async () => {
    const res = await fetch(`/api/host/calendar?propertyId=${selectedPropertyId}&start=${start}&end=${end}`, { credentials: 'include', cache: 'no-store' });
    const json = await res.json();
    setData(json);
  }, [selectedPropertyId, start, end]);

  useEffect(() => { load(); }, [load]);

  const dates = useMemo(() => eachDay(start, end), [start, end]);
  const properties = data.properties.slice(0, 10);
  const dayMap = useMemo(() => {
    const map = new Map<string, Day>();
    for (const day of data.days) map.set(`${day.propertyId}:${day.date}`, day);
    return map;
  }, [data.days]);

  const onCellDown = (propertyId: string, date: string) => {
    const cell = dayMap.get(`${propertyId}:${date}`);
    if (cell?.isBooked) return;
    setSelection({ propertyId, start: date, end: date });
  };

  const onCellEnter = (propertyId: string, date: string) => {
    if (!selection || selection.propertyId !== propertyId) return;
    const cell = dayMap.get(`${propertyId}:${date}`);
    if (cell?.isBooked) return;
    setSelection({ ...selection, end: date });
  };

  const onMouseUp = () => { if (selection) setDrawerOpen(true); };

  const saveSelection = async () => {
    if (!selection) return;
    const startDate = selection.start <= selection.end ? selection.start : selection.end;
    const endDate = selection.start <= selection.end ? selection.end : selection.start;
    const res = await fetch('/api/host/calendar', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: selection.propertyId, ranges: [{ start: startDate, end: endDate, status: draft.status, price: draft.price ? Number(draft.price) : undefined, minNights: draft.minNights ? Number(draft.minNights) : undefined, notes: draft.notes || undefined }] })
    });
    if (res.ok) {
      setDrawerOpen(false);
      setSelection(null);
      setDraft({ status: 'blocked', price: '', minNights: '', notes: '' });
      load();
    } else {
      const json = await res.json().catch(() => ({}));
      alert(json.error || 'Failed to save calendar update');
    }
  };

  const selectedMeta = useMemo(() => {
    if (!selection) return null;
    const startDate = new Date(selection.start <= selection.end ? selection.start : selection.end);
    const endDate = new Date(selection.start <= selection.end ? selection.end : selection.start);
    return { label: `${formatYmd(startDate)} - ${formatYmd(endDate)}`, nights: diffDays(startDate, toDate(addDaysYmd(endDate, 1))!) };
  }, [selection]);

  if (data.properties.length === 0) {
    return <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center"><h1 className="text-2xl font-semibold text-neutral-900">No listings yet</h1><p className="mt-2 text-neutral-500">Add your first listing to start managing availability and pricing.</p><Link href="/host/listings/new" className="mt-6 inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-white">Add your first listing</Link></div>;
  }

  return (
    <div className="space-y-4" onMouseUp={onMouseUp}>
      <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm">
            <option value="all">All listings</option>
            {data.properties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}
          </select>
          <button onClick={() => setMonthOffset((v) => v - 1)} className="rounded-full border border-neutral-200 p-2"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setMonthOffset((v) => v + 1)} className="rounded-full border border-neutral-200 p-2"><ChevronRight className="h-4 w-4" /></button>
          <button onClick={() => setMonthOffset(0)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm">Today</button>
        </div>
        <div className="text-sm text-neutral-500">Drag across dates to block nights or override pricing.</div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-auto">
          <div className="grid min-w-[1400px]" style={{ gridTemplateColumns: `240px repeat(${dates.length}, minmax(72px, 1fr))` }}>
            <div className="sticky left-0 z-20 border-b border-r border-neutral-200 bg-white p-4 text-sm font-medium text-neutral-500">Listings</div>
            {dates.map((date: string) => <div key={date} className="border-b border-neutral-200 p-2 text-center text-xs text-neutral-500"><div>{date.slice(5)}</div><div className="mt-1">&nbsp;</div></div>)}
            {properties.map((property) => (
              <><div key={`${property.id}-label`} className="sticky left-0 z-10 border-r border-neutral-200 bg-white p-4 font-medium text-neutral-900">{property.title}</div>{dates.map((date: string) => {
                const cell = dayMap.get(`${property.id}:${date}`) || { date, propertyId: property.id, status: 'available', price: property.basePrice ? property.basePrice * 100 : null, isBooked: false };
                const isSelected = selection && selection.propertyId === property.id && date >= (selection.start <= selection.end ? selection.start : selection.end) && date <= (selection.start <= selection.end ? selection.end : selection.start);
                const className = cell.isBooked ? bookedCellClassName : cell.status === 'blocked' ? blockedCellClassName : availableCellClassName;
                return <button type="button" title={cell.isBooked ? 'Booked by Guest' : date} key={`${property.id}-${date}`} onMouseDown={() => onCellDown(property.id, date)} onMouseEnter={() => onCellEnter(property.id, date)} className={cn("relative h-16 border-b border-r border-neutral-100 px-1 text-center text-xs hover:bg-blue-50", className, isSelected && "border-2 border-primary-500")}>{cell.isBooked ? <span className="inline-flex items-center gap-1 text-[11px]"><Lock className="h-3 w-3" />Booked</span> : cell.status === 'blocked' ? <span className="inline-flex items-center gap-1 text-[11px]"><Lock className="h-3 w-3" />Blocked</span> : <span className="text-[11px] text-neutral-500">{toMoney(cell.price)}</span>}</button>;
              })}</>
            ))}
          </div>
        </div>
      </div>

      {drawerOpen && selection && selectedMeta ? (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-neutral-200 bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-neutral-900">Edit availability</h2>
          <p className="mt-2 text-sm text-neutral-500">{selectedMeta.label} ({selectedMeta.nights} nights)</p>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-neutral-700">Status<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"><option value="available">Available</option><option value="blocked">Blocked</option></select></label>
            <label className="block text-sm font-medium text-neutral-700">Custom price (CAD)<input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} type="number" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" /></label>
            <label className="block text-sm font-medium text-neutral-700">Minimum nights<input value={draft.minNights} onChange={(e) => setDraft({ ...draft, minNights: e.target.value })} type="number" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" /></label>
            <label className="block text-sm font-medium text-neutral-700">Notes<textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className="mt-2 min-h-28 w-full rounded-xl border border-neutral-200 px-4 py-3" /></label>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => { setDrawerOpen(false); setSelection(null); }} className="flex-1 rounded-xl border border-neutral-200 px-4 py-3">Cancel</button>
            <button onClick={saveSelection} className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-white">Save</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { addDaysYmd, diffDays, eachDay, formatYmd, toDate } from "@/lib/host-date";
import { ChevronLeft, ChevronRight, Lock, AlertTriangle, RefreshCw, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { ensureCsrfToken } from "@/lib/security/csrf-client";

type Property = { id: string; title: string; basePrice?: number };
type Day = { date: string; propertyId: string; status: string; price: number | null; isBooked: boolean; bookingId?: string };

function toMoney(value?: number | null) {
  if (value == null) return '—';
  const dollars = Math.round(value / 100);
  if (dollars === 0) return '$0 CAD';
  return `$${dollars.toLocaleString()} CAD`;
}

function isWeekend(dateStr: string) {
  const d = toDate(dateStr);
  if (!d) return false;
  const day = d.getDay();
  return day === 0 || day === 6;
}

function getMonthLabel(dateStr: string) {
  const d = toDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const DAY_W = 48; // px per day column
const LABEL_W = 180; // px for property name column

export default function HostCalendar() {
  const [data, setData] = useState<{ properties: Property[]; days: Day[] }>({ properties: [], days: [] });
  const [error, setError] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selection, setSelection] = useState<{ propertyId: string; start: string; end: string } | null>(null);
  const [draft, setDraft] = useState({ status: 'blocked', price: '', minNights: '', notes: '' });
  const [monthOffset, setMonthOffset] = useState(0);
  const today = toDate(new Date())!;
  today.setHours(0, 0, 0, 0);
  const start = addDaysYmd(today, monthOffset * 30);
  const end = addDaysYmd(start, 89);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/host/calendar?propertyId=${selectedPropertyId}&start=${start}&end=${end}`, { credentials: 'include', cache: 'no-store' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || `Server error (${res.status})`);
        return;
      }
      const json = await res.json();
      if (!json || !Array.isArray(json.properties) || !Array.isArray(json.days)) {
        setError('Invalid response from server');
        return;
      }
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    }
  }, [selectedPropertyId, start, end]);

  useEffect(() => { load(); }, [load]);

  // Scroll to today when monthOffset changes to 0
  useEffect(() => {
    if (monthOffset === 0 && scrollRef.current && dates.length > 0) {
      const todayCol = dates.findIndex(d => d === formatYmd(today));
      if (todayCol >= 0) {
        scrollRef.current.scrollLeft = todayCol * DAY_W - 200;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOffset]);

  const dates = useMemo(() => eachDay(start, end), [start, end]);
  const properties = data.properties.slice(0, 10);
  const dayMap = useMemo(() => {
    const map = new Map<string, Day>();
    for (const day of data.days) map.set(`${day.propertyId}:${day.date}`, day);
    return map;
  }, [data.days]);

  // Compute month spans for header
  const monthHeaders = useMemo(() => {
    const headers: { label: string; colStart: number; colSpan: number }[] = [];
    let prev: string | null = null;
    for (let i = 0; i < dates.length; i++) {
      const label = getMonthLabel(dates[i]);
      if (label !== prev) {
        headers.push({ label, colStart: i, colSpan: 1 });
        prev = label;
      } else {
        headers[headers.length - 1].colSpan++;
      }
    }
    return headers;
  }, [dates]);

  const todayStr = formatYmd(today);

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
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': ensureCsrfToken() },
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

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-xl font-semibold text-red-800">页面加载失败</h1>
        <p className="mt-2 text-red-600">{error}</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={() => load()} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-white hover:bg-red-700">
            <RefreshCw className="h-4 w-4" />重试
          </button>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-red-700 hover:bg-red-100">
            <Home className="h-4 w-4" />返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (data.properties.length === 0) {
    return <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center"><h1 className="text-2xl font-semibold text-neutral-900">No listings yet</h1><p className="mt-2 text-neutral-500">Add your first listing to start managing availability and pricing.</p><Link href="/host/listings/new" className="mt-6 inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-white">Add your first listing</Link></div>;
  }

  return (
    <div className="space-y-4" onMouseUp={onMouseUp}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium">
            <option value="all">All listings</option>
            {data.properties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <button onClick={() => setMonthOffset((v) => v - 1)} className="rounded-full border border-neutral-200 p-2 hover:bg-neutral-50"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setMonthOffset((v) => v + 1)} className="rounded-full border border-neutral-200 p-2 hover:bg-neutral-50"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => setMonthOffset(0)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50">Today</button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-neutral-400" /> Blocked</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Booked</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        {/* Scrollable area */}
        <div ref={scrollRef} className="overflow-x-auto" style={{ scrollBehavior: 'smooth' }}>
          <div style={{ width: LABEL_W + dates.length * DAY_W, minWidth: '100%' }}>
            {/* Month header row */}
            <div className="sticky top-0 z-20 flex border-b border-neutral-200 bg-white">
              <div className="sticky left-0 z-30 flex-shrink-0 border-r border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-500" style={{ width: LABEL_W }}>
                {dates.length} nights
              </div>
              {monthHeaders.map((mh) => (
                <div key={mh.label} className="flex items-center justify-center border-r border-neutral-100 px-1 py-3 text-xs font-semibold text-neutral-600" style={{ width: mh.colSpan * DAY_W, minWidth: mh.colSpan * DAY_W }}>
                  {mh.label}
                </div>
              ))}
            </div>

            {/* Property rows */}
            {properties.map((property, pi) => (
              <div key={property.id} className={cn("flex", pi > 0 && "border-t border-neutral-100")}>
                {/* Property name (sticky left) */}
                <div className="sticky left-0 z-10 flex-shrink-0 border-r border-neutral-200 bg-white px-4 py-3" style={{ width: LABEL_W }}>
                  <p className="text-sm font-medium text-neutral-900 truncate">{property.title}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{toMoney((property.basePrice || 0) * 100)}/night</p>
                </div>

                {/* Day cells */}
                {dates.map((date) => {
                  const cell = dayMap.get(`${property.id}:${date}`) || { date, propertyId: property.id, status: 'available', price: (property.basePrice || 0) * 100, isBooked: false };
                  const isSelected = selection && selection.propertyId === property.id && date >= (selection.start <= selection.end ? selection.start : selection.end) && date <= (selection.start <= selection.end ? selection.end : selection.start);
                  const isToday = date === todayStr;
                  const weekend = isWeekend(date);

                  return (
                    <button
                      type="button"
                      title={cell.isBooked ? 'Booked by Guest' : date}
                      key={`${property.id}-${date}`}
                      onMouseDown={() => onCellDown(property.id, date)}
                      onMouseEnter={() => onCellEnter(property.id, date)}
                      style={{ width: DAY_W, minWidth: DAY_W, height: 56 }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 border-r border-neutral-50 text-center transition-colors select-none",
                        weekend && !cell.isBooked && cell.status !== 'blocked' && "bg-amber-50/40",
                        cell.isBooked && "bg-neutral-100 cursor-not-allowed",
                        cell.status === 'blocked' && !isSelected && "bg-neutral-100",
                        isSelected && "bg-blue-50 ring-1 ring-inset ring-blue-400 z-10",
                        !cell.isBooked && cell.status !== 'blocked' && !isSelected && "hover:bg-neutral-50"
                      )}
                    >
                      {cell.isBooked ? (
                        <>
                          <Lock className="h-3.5 w-3.5 text-neutral-400" />
                          <span className="text-[10px] text-neutral-400">Booked</span>
                        </>
                      ) : cell.status === 'blocked' ? (
                        <>
                          <span className={cn("inline-block h-2 w-2 rounded-full", isSelected ? "bg-blue-500" : "bg-neutral-400")} />
                          <span className="text-[10px] text-neutral-400">{toMoney(cell.price)}</span>
                        </>
                      ) : (
                        <>
                          {isToday ? (
                            <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white">{date.slice(8)}</span>
                          ) : (
                            <span className="text-[10px] text-neutral-400">{date.slice(8)}</span>
                          )}
                          <span className={cn("inline-block h-2 w-2 rounded-full", isSelected ? "bg-blue-500" : "bg-emerald-500")} />
                          <span className="text-[10px] font-medium text-neutral-600">{toMoney(cell.price)}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Empty state row if no properties visible */}
            {properties.length === 0 && (
              <div className="flex items-center justify-center py-20 text-sm text-neutral-400">
                No listings match the filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
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

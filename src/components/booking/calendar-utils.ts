export interface BookedDateRange {
  start: string;
  end: string;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDate(dateLike: string | Date): Date {
  const date = typeof dateLike === 'string' ? new Date(`${dateLike}T00:00:00`) : new Date(dateLike);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

export function isDateBooked(date: Date, bookedRanges: BookedDateRange[]): boolean {
  return bookedRanges.some((range) => {
    const start = normalizeDate(range.start);
    const end = normalizeDate(range.end);
    return date >= start && date < end;
  });
}

export function hasBookedDateInRange(startDateLike: string | Date, endDateLike: string | Date, bookedRanges: BookedDateRange[]): boolean {
  if (!startDateLike || !endDateLike) return false;

  let cursor = normalizeDate(startDateLike);
  const end = normalizeDate(endDateLike);

  if (cursor >= end) return false;

  while (cursor < end) {
    if (isDateBooked(cursor, bookedRanges)) return true;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }

  return false;
}

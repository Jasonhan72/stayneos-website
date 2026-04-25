export function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toDate(value: string | Date) {
  const date = value instanceof Date ? new Date(value) : new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatYmd(value: string | Date) {
  const date = toDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function addDaysYmd(value: string | Date, days: number) {
  const date = toDate(value);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  return formatYmd(date);
}

export function diffDays(start: string | Date, end: string | Date) {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return 0;
  return Math.round((e.getTime() - s.getTime()) / 86400000);
}

export function eachDay(start: string | Date, end: string | Date) {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return [];
  const days: string[] = [];
  const cursor = new Date(s);
  while (cursor <= e) {
    days.push(formatYmd(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;

}

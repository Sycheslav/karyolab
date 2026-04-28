import {
  startOfMonth,
  startOfWeek,
  endOfMonth,
  endOfWeek,
  addDays,
  format,
  isSameDay,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  differenceInCalendarDays,
} from "date-fns";
import { ru } from "date-fns/locale";

export function classNames(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export function isoDay(d: Date | string) {
  const dt = typeof d === "string" ? parseISO(d) : d;
  return format(dt, "yyyy-MM-dd");
}

export function fmtDateLong(d: Date | string) {
  const dt = typeof d === "string" ? parseISO(d) : d;
  return format(dt, "d MMMM yyyy", { locale: ru });
}

export function fmtMonthYear(d: Date | string) {
  const dt = typeof d === "string" ? parseISO(d) : d;
  return format(dt, "LLLL yyyy", { locale: ru }).replace(/^./, (c) =>
    c.toUpperCase()
  );
}

export function fmtDay(d: Date | string) {
  const dt = typeof d === "string" ? parseISO(d) : d;
  return format(dt, "d");
}

export function fmtTime(d: Date | string) {
  const dt = typeof d === "string" ? parseISO(d) : d;
  return format(dt, "HH:mm");
}

export function fmtDateShort(d: Date | string) {
  const dt = typeof d === "string" ? parseISO(d) : d;
  return format(dt, "d MMM", { locale: ru });
}

/**
 * Build a 6-row grid (42 cells) of days for the given month, starting Monday.
 */
export function buildMonthGrid(anchor: Date) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  const cells: Date[] = [];
  let cur = start;
  while (cur <= end) {
    cells.push(cur);
    cur = addDays(cur, 1);
  }
  // Make sure we always have 6 weeks (42 days)
  while (cells.length < 42) cells.push(addDays(cells[cells.length - 1], 1));
  return cells;
}

export function buildWeekGrid(anchor: Date) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function eventOverlapsDay<T extends { startDate: string; endDate?: string }>(
  ev: T,
  day: Date
) {
  const s = startOfDay(parseISO(ev.startDate));
  const e = endOfDay(parseISO(ev.endDate ?? ev.startDate));
  return isWithinInterval(day, { start: s, end: e });
}

export function eventDayIndex<T extends { startDate: string; endDate?: string }>(
  ev: T,
  day: Date
) {
  const s = startOfDay(parseISO(ev.startDate));
  return differenceInCalendarDays(day, s) + 1;
}

export function eventTotalDays<T extends { startDate: string; endDate?: string }>(
  ev: T
) {
  const s = startOfDay(parseISO(ev.startDate));
  const e = startOfDay(parseISO(ev.endDate ?? ev.startDate));
  return differenceInCalendarDays(e, s) + 1;
}

export { isSameDay, parseISO };

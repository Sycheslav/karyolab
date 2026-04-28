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

/**
 * Группирует список ивентов по паре «(день старта, тип)».
 *
 * Используется и в календаре, и в ленте дня для требования заказчика
 * «несколько ивентов одного типа за день показываются одной плашкой /
 * строкой». Возвращает массив групп с ключом `${date}|${type}`.
 *
 * Учитывается только день начала ивента (`startDate`), без раскладки
 * многодневных ивентов на каждый из перекрытых дней — это делается
 * отдельно в календаре через `eventOverlapsDay`.
 */
export function groupEventsByDayAndType<
  T extends { id: string; startDate: string; type: string }
>(events: T[]): Array<{ date: string; type: string; items: T[] }> {
  const m = new Map<string, T[]>();
  for (const ev of events) {
    const day = isoDay(ev.startDate);
    const key = `${day}|${ev.type}`;
    const arr = m.get(key) ?? [];
    arr.push(ev);
    m.set(key, arr);
  }
  return Array.from(m.entries()).map(([key, items]) => {
    const [date, type] = key.split("|");
    return { date, type, items };
  });
}

const BATCH_PREFIX: Record<string, string> = {
  germination: "GER",
  wash: "WP",
  hybridization: "HYB",
  photographing: "PHOTO",
  slide: "SLD",
  free: "FREE",
};

/**
 * Дефолтное имя партии для ивента вида `{префикс}-{YYYY-MM-DD}` или
 * `{префикс}-{YYYY-MM-DD}-{N}`, если в этот день уже есть партия того же типа.
 *
 * @param type   тип ивента (germination, wash, hybridization, …)
 * @param date   ISO-дата дня (YYYY-MM-DD)
 * @param sameDayCount  число существующих партий того же типа в этот день
 */
export function defaultBatchName(
  type: string,
  date: string,
  sameDayCount: number
): string {
  const prefix = BATCH_PREFIX[type] ?? type.toUpperCase();
  if (sameDayCount <= 0) return `${prefix}-${date}`;
  return `${prefix}-${date}-${sameDayCount + 1}`;
}

export { isSameDay, parseISO };

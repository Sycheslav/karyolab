import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  addMonths,
  isSameMonth,
  parseISO,
  startOfDay,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  buildMonthGrid,
  buildWeekGrid,
  classNames,
  fmtMonthYear,
  isoDay,
} from "@/lib/utils";
import EventPill from "./EventPill";
import { eventTypeLabel } from "./eventColors";
import Tabs from "../ui/Tabs";
import type { JournalEvent } from "@/lib/types";

const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const MAX_VISIBLE_BARS = 3;

interface Props {
  className?: string;
}

/**
 * Группа ивентов одного типа, начинающихся в один день.
 * Если в группе больше одного — рендерится один агрегированный bar
 * с подписью «{label} · N шт.» (правка 2).
 */
interface BarGroup {
  /** Стабильный ключ для React. */
  key: string;
  /** Тип события (для подписи и стиля). */
  type: JournalEvent["type"];
  /** Все ивенты группы (может быть один). */
  items: JournalEvent[];
  /** Длина (в днях) внутри недели. */
  span: number;
  /** Стартовый столбец 0..6 в неделе. */
  startCol: number;
  /** Строка раскладки (0,1,2,…). */
  row: number;
  /** Позиция многодневной плашки относительно границ недели. */
  position: "single" | "start" | "middle" | "end";
}

export default function CalendarMonth({ className }: Props) {
  const nav = useNavigate();
  const events = useStore((s) => s.events);
  const selectedDate = useStore((s) => s.selectedDate);
  const setSelected = useStore((s) => s.setSelectedDate);

  // По требованию заказчика «День» убран — оставлены только Месяц/Неделя.
  const [view, setView] = useState<"month" | "week">("month");
  const [anchor, setAnchor] = useState<Date>(() => parseISO(selectedDate));

  // Поповер по «+N ещё» / по группе — рендерится через React portal,
  // чтобы не перекрывать TopBar/Sidebar и не вылезать за границы ячеек.
  const [popover, setPopover] = useState<{
    items: JournalEvent[];
    title: string;
    x: number;
    y: number;
  } | null>(null);

  const days = useMemo(() => {
    if (view === "month") return buildMonthGrid(anchor);
    return buildWeekGrid(anchor);
  }, [view, anchor]);

  const weeks = useMemo(() => {
    if (view === "week") return [days];
    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [days, view]);

  /**
   * Раскладка ивентов в неделе с учётом стака:
   *   - все ивенты одного типа, стартующие в один день, группируются
   *     в одну BarGroup;
   *   - row подбирается так, чтобы не было пересечений по колонкам.
   */
  function eventsForWeek(week: Date[]): BarGroup[] {
    const groups: BarGroup[] = [];
    const cellRows: number[][] = Array.from({ length: week.length }, () => []);

    const sorted = [...events].sort((a, b) => {
      const da = +parseISO(a.startDate);
      const db = +parseISO(b.startDate);
      return da - db;
    });

    // Сначала склеим в (startDay|type) — это и есть «стак ивентов».
    const grouped = new Map<string, JournalEvent[]>();
    for (const ev of sorted) {
      const day = isoDay(ev.startDate);
      const key = `${day}|${ev.type}`;
      const arr = grouped.get(key) ?? [];
      arr.push(ev);
      grouped.set(key, arr);
    }

    for (const items of grouped.values()) {
      // Span определяется первым ивентом группы (самым ранним).
      const head = items[0];
      const evStart = startOfDay(parseISO(head.startDate));
      const evEnd = startOfDay(parseISO(head.endDate ?? head.startDate));
      const weekStart = week[0];
      const weekEnd = week[week.length - 1];
      if (evEnd < weekStart || evStart > weekEnd) continue;

      const startIdx = Math.max(
        0,
        week.findIndex((d) => +startOfDay(d) >= +evStart)
      );
      let endIdx = week.length - 1;
      for (let i = week.length - 1; i >= 0; i--) {
        if (+startOfDay(week[i]) <= +evEnd) {
          endIdx = i;
          break;
        }
      }
      if (endIdx < startIdx) continue;
      const span = endIdx - startIdx + 1;

      let row = 0;
      while (
        Array.from({ length: span }, (_, k) => startIdx + k).some((c) =>
          cellRows[c].includes(row)
        )
      ) {
        row++;
      }
      for (let k = 0; k < span; k++) cellRows[startIdx + k].push(row);

      const startsHere = evStart >= startOfDay(weekStart);
      const endsHere = evEnd <= startOfDay(weekEnd);
      const position: BarGroup["position"] =
        span === 1 || (startsHere && endsHere)
          ? "single"
          : startsHere
            ? "start"
            : endsHere
              ? "end"
              : "middle";

      groups.push({
        key: `${head.id}|${head.type}|${row}`,
        type: head.type,
        items,
        span,
        startCol: startIdx,
        row,
        position,
      });
    }
    return groups;
  }

  function openPopoverForCell(
    e: React.MouseEvent,
    items: JournalEvent[],
    title: string
  ) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopover({
      items,
      title,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 4,
    });
  }

  function openPopoverForBar(e: React.MouseEvent, group: BarGroup) {
    if (group.items.length === 1) {
      // одиночный ивент — обычная навигация, поповер не нужен
      nav(`/журнал/ивент/${group.items[0].id}`);
      return;
    }
    openPopoverForCell(
      e,
      group.items,
      `${eventTypeLabel[group.type]} · ${group.items.length} ивентов`
    );
  }

  // Закрытие поповера по клику снаружи / ESC.
  const popoverRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!popover) return;
    const onDoc = (ev: MouseEvent) => {
      if (popoverRef.current && popoverRef.current.contains(ev.target as Node))
        return;
      setPopover(null);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setPopover(null);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [popover]);

  return (
    <div className={classNames("card card-pad", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Стрелки — слева/справа от названия месяца, без кнопки «Сегодня» (правка 3). */}
          <button
            onClick={() => setAnchor((a) => addMonths(a, -1))}
            className="grid h-7 w-7 place-items-center rounded-full border border-brand-line text-brand-deep transition hover:bg-brand-cream"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setAnchor(new Date())}
            title="Перейти к сегодняшнему дню"
            className="text-[26px] font-extrabold text-brand-deep transition hover:text-brand"
          >
            {fmtMonthYear(anchor)}
          </button>
          <button
            onClick={() => setAnchor((a) => addMonths(a, 1))}
            className="grid h-7 w-7 place-items-center rounded-full border border-brand-line text-brand-deep transition hover:bg-brand-cream"
            aria-label="Следующий месяц"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <Tabs
          value={view}
          onChange={(v) => setView(v as "month" | "week")}
          options={[
            { id: "month", label: "Месяц" },
            { id: "week", label: "Неделя" },
          ]}
        />
      </div>

      <div className="grid grid-cols-7 border-b border-brand-line">
        {DOW.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-[12px] font-semibold uppercase tracking-wider text-brand-muted"
          >
            {d}
          </div>
        ))}
      </div>

      <div>
        {weeks.map((week, wi) => {
          const groups = eventsForWeek(week);
          const today = new Date();
          // Подсчёт всех групп, которые касаются каждой колонки — для логики «+N ещё».
          const groupsPerCol: BarGroup[][] = Array.from(
            { length: week.length },
            () => []
          );
          for (const g of groups) {
            for (let k = 0; k < g.span; k++) {
              groupsPerCol[g.startCol + k].push(g);
            }
          }

          return (
            <div
              key={wi}
              className="relative grid min-h-[120px] grid-cols-7 overflow-hidden border-b border-brand-line/70 last:border-b-0"
            >
              {week.map((d, di) => {
                const isCurMonth = isSameMonth(d, anchor);
                const isSelected = isoDay(d) === selectedDate;
                const isToday = isSameDay(d, today);
                const cellGroups = groupsPerCol[di];
                const overflow = cellGroups.length - MAX_VISIBLE_BARS;
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => setSelected(isoDay(d))}
                    className={classNames(
                      // Фиксированная высота ячейки — календарь больше не «расползается»
                      // от ивентов (правка 1).
                      "group relative flex min-h-[120px] max-h-[140px] flex-col items-stretch overflow-hidden border-r border-brand-line/70 p-2 text-left transition last:border-r-0",
                      isSelected
                        ? "bg-brand-cream"
                        : "bg-white hover:bg-brand-mint/60",
                      !isCurMonth && "bg-brand-mint/30 text-brand-muted/60"
                    )}
                  >
                    <span
                      className={classNames(
                        "text-[12.5px] font-semibold",
                        isToday &&
                          "inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white"
                      )}
                    >
                      {d.getDate()}
                    </span>

                    {/* Кнопка «+» вынесена в правый верхний угол выше z-слоя плашек (правка 1.5). */}
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(isoDay(d));
                        nav(`/журнал/новый-ивент?date=${isoDay(d)}`);
                      }}
                      title="Создать ивент на эту дату"
                      className="absolute right-1 top-1 z-20 grid h-5 w-5 place-items-center rounded-full border border-brand-line bg-white text-brand-muted opacity-0 transition group-hover:opacity-100 hover:bg-brand hover:text-white"
                    >
                      <Plus size={11} />
                    </span>

                    {/* «+N ещё» при переполнении — поповер через portal (правка 1.2/1.3). */}
                    {overflow > 0 && (
                      <span
                        role="button"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          const items = cellGroups.flatMap((g) => g.items);
                          openPopoverForCell(
                            e,
                            items,
                            `Ещё ${overflow} ивент(ов) на ${isoDay(d)}`
                          );
                        }}
                        title="Показать остальные ивенты дня"
                        className="absolute bottom-1 left-1 z-10 cursor-pointer rounded-full bg-brand-deep/85 px-1.5 py-0.5 text-[10px] font-semibold text-brand-cream"
                      >
                        +{overflow} ещё
                      </span>
                    )}
                  </button>
                );
              })}

              {/* event bands overlay (видимые) */}
              <div className="pointer-events-none absolute inset-x-0 top-8 grid grid-cols-7 gap-y-1 px-1">
                {groups
                  .filter((g) => g.row < MAX_VISIBLE_BARS)
                  .map((g) => {
                    const head = g.items[0];
                    const label =
                      g.items.length > 1
                        ? `${eventTypeLabel[g.type]} · ${g.items.length} шт.`
                        : g.type === "slide"
                          ? // Заказчик: для slide всегда формат «N шт.», даже если 1.
                            `${eventTypeLabel[g.type]} · 1 шт.`
                          : head.title;
                    return (
                      <div
                        key={g.key}
                        className="pointer-events-auto"
                        style={{
                          gridColumn: `${g.startCol + 1} / span ${g.span}`,
                          gridRow: g.row + 1,
                        }}
                      >
                        <EventPill
                          ev={head}
                          type={g.type}
                          label={label}
                          position={g.position}
                          showLabel={g.span >= 2 || g.position !== "middle"}
                          onClick={(e) => openPopoverForBar(e, g)}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {popover &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "absolute", top: popover.y, left: popover.x }}
            className="z-[1000] w-72 rounded-2xl border border-brand-line bg-white p-3 shadow-soft"
          >
            <div className="mb-2 text-[11.5px] font-bold uppercase tracking-wider text-brand-muted">
              {popover.title}
            </div>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {popover.items.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => {
                    setPopover(null);
                    nav(`/журнал/ивент/${ev.id}`);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-brand-line bg-white px-2.5 py-1.5 text-left text-[12.5px] font-semibold text-brand-deep transition hover:bg-brand-mint/40"
                >
                  <span className="truncate">{ev.title}</span>
                  <span className="shrink-0 rounded-full bg-brand-cream px-2 py-0.5 text-[10px] uppercase tracking-wider text-brand-dark">
                    {eventTypeLabel[ev.type]}
                  </span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

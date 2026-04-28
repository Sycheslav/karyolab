import { useMemo, useState } from "react";
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
import Tabs from "../ui/Tabs";
import type { JournalEvent } from "@/lib/types";

const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface Props {
  className?: string;
}

interface Bar {
  ev: JournalEvent;
  startCol: number; // 0..6 within the week
  span: number;
  row: number;
}

export default function CalendarMonth({ className }: Props) {
  const nav = useNavigate();
  const events = useStore((s) => s.events);
  const selectedDate = useStore((s) => s.selectedDate);
  const setSelected = useStore((s) => s.setSelectedDate);

  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [anchor, setAnchor] = useState<Date>(() => parseISO(selectedDate));

  const days = useMemo(() => {
    if (view === "month") return buildMonthGrid(anchor);
    if (view === "week") return buildWeekGrid(anchor);
    return [anchor];
  }, [view, anchor]);

  const weeks = useMemo(() => {
    if (view === "day") return [[anchor]];
    if (view === "week") return [days];
    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [days, view, anchor]);

  function eventsForWeek(week: Date[]): Bar[] {
    const bars: Bar[] = [];
    const cellRows: number[][] = Array.from({ length: week.length }, () => []);

    const sorted = [...events].sort((a, b) => {
      const da = +parseISO(a.startDate);
      const db = +parseISO(b.startDate);
      return da - db;
    });

    for (const ev of sorted) {
      const evStart = startOfDay(parseISO(ev.startDate));
      const evEnd = startOfDay(parseISO(ev.endDate ?? ev.startDate));
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
      bars.push({ ev, startCol: startIdx, span, row });
    }
    return bars;
  }

  return (
    <div className={classNames("card card-pad", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[26px] font-extrabold text-brand-deep">
            {fmtMonthYear(anchor)}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAnchor((a) => addMonths(a, -1))}
              className="grid h-7 w-7 place-items-center rounded-full border border-brand-line text-brand-deep transition hover:bg-brand-cream"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setAnchor(new Date())}
              className="rounded-full border border-brand-line bg-white px-3 py-1 text-[11.5px] font-semibold text-brand-deep transition hover:bg-brand-cream"
              title="Перейти к сегодняшнему дню"
            >
              Сегодня
            </button>
            <button
              onClick={() => setAnchor((a) => addMonths(a, 1))}
              className="grid h-7 w-7 place-items-center rounded-full border border-brand-line text-brand-deep transition hover:bg-brand-cream"
              aria-label="Следующий месяц"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <Tabs
          value={view}
          onChange={(v) => setView(v as "month" | "week" | "day")}
          options={[
            { id: "month", label: "Месяц" },
            { id: "week", label: "Неделя" },
            { id: "day", label: "День" },
          ]}
        />
      </div>

      {view === "day" ? (
        <div className="rounded-xl border border-brand-line bg-brand-mint/40 p-6 text-sm text-brand-muted">
          Выбран один день. События смотрите в правой колонке «События дня».
          Используйте «+ Добавить ивент», чтобы создать событие на этот день.
        </div>
      ) : (
        <>
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
              const bars = eventsForWeek(week);
              const today = new Date();
              return (
                <div
                  key={wi}
                  className="relative grid grid-cols-7 border-b border-brand-line/70 last:border-b-0"
                >
                  {week.map((d) => {
                    const isCurMonth = isSameMonth(d, anchor);
                    const isSelected = isoDay(d) === selectedDate;
                    const isToday = isSameDay(d, today);
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        onClick={() => setSelected(isoDay(d))}
                        className={classNames(
                          "group relative flex h-[100px] flex-col items-stretch border-r border-brand-line/70 p-2 text-left transition last:border-r-0",
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

                        <span
                          role="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(isoDay(d));
                            nav(`/журнал/новый-ивент?date=${isoDay(d)}`);
                          }}
                          title="Создать ивент на эту дату"
                          className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full border border-brand-line bg-white text-brand-muted opacity-0 transition group-hover:opacity-100 hover:bg-brand hover:text-white"
                        >
                          <Plus size={11} />
                        </span>
                      </button>
                    );
                  })}

                  {/* event bands overlay */}
                  <div className="pointer-events-none absolute inset-x-0 top-8 grid grid-cols-7 gap-y-1 px-1">
                    {bars.map((b, idx) => {
                      const evStart = startOfDay(parseISO(b.ev.startDate));
                      const evEnd = startOfDay(
                        parseISO(b.ev.endDate ?? b.ev.startDate)
                      );
                      const weekStart = startOfDay(week[0]);
                      const weekEnd = startOfDay(week[week.length - 1]);
                      const startsHere = evStart >= weekStart;
                      const endsHere = evEnd <= weekEnd;
                      const position =
                        b.span === 1 && startsHere && endsHere
                          ? "single"
                          : startsHere && endsHere
                            ? "single"
                            : startsHere
                              ? "start"
                              : endsHere
                                ? "end"
                                : "middle";
                      return (
                        <div
                          key={idx}
                          className="pointer-events-auto"
                          style={{
                            gridColumn: `${b.startCol + 1} / span ${b.span}`,
                            gridRow: b.row + 1,
                          }}
                        >
                          <EventPill
                            ev={b.ev}
                            position={position}
                            showLabel={b.span >= 2 || startsHere}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

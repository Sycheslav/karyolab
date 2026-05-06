import { useNavigate } from "react-router-dom";
import { ChevronRight, Plus, StickyNote } from "lucide-react";
import { useStore } from "@/lib/store";
import { useMemo } from "react";
import { parseISO, startOfDay } from "date-fns";
import {
  eventLeftBar,
  eventTypeLabel,
} from "@/components/calendar/eventColors";
import { classNames, fmtDateLong, fmtTime, isoDay } from "@/lib/utils";
import Button from "@/components/ui/Button";
import type { EventType, JournalEvent } from "@/lib/types";

interface DayEventGroup {
  kind: "event-group";
  type: EventType;
  items: JournalEvent[];
  /** Сортировка по самой ранней дате в группе. */
  time: string;
}

interface DayNote {
  kind: "note";
  id: string;
  time: string;
  title: string;
  comment?: string;
}

type DayItem = DayEventGroup | DayNote;

export default function TodayEvents() {
  const events = useStore((s) => s.events);
  const notes = useStore((s) => s.notes);
  const selectedDate = useStore((s) => s.selectedDate);
  const nav = useNavigate();

  const dayItems = useMemo<DayItem[]>(() => {
    const d = startOfDay(parseISO(selectedDate));
    const evs = events.filter((ev) => {
      const s = startOfDay(parseISO(ev.startDate));
      const e = startOfDay(parseISO(ev.endDate ?? ev.startDate));
      return d >= s && d <= e;
    });

    // Группируем ивенты дня по типу — несколько одного типа отображаются
    // одной строкой с подписью «{label} · N шт.» (правка 2).
    const grouped = new Map<EventType, JournalEvent[]>();
    for (const ev of evs) {
      const arr = grouped.get(ev.type) ?? [];
      arr.push(ev);
      grouped.set(ev.type, arr);
    }
    const groups: DayEventGroup[] = Array.from(grouped.entries()).map(
      ([type, items]) => ({
        kind: "event-group",
        type,
        items: items.sort((a, b) => +parseISO(a.startDate) - +parseISO(b.startDate)),
        time: items.reduce(
          (min, ev) => (ev.startDate < min ? ev.startDate : min),
          items[0].startDate
        ),
      })
    );

    const dayNotes: DayNote[] = notes
      .filter((n) => !n.archived && isoDay(n.createdAt) === selectedDate)
      .map((n) => ({
        kind: "note",
        id: n.id,
        time: n.createdAt,
        title: n.title,
        comment: n.body,
      }));

    return [...groups, ...dayNotes].sort(
      (a, b) => +parseISO(a.time) - +parseISO(b.time)
    );
  }, [events, notes, selectedDate]);

  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[16px] font-bold text-brand-deep">События дня</h3>
          <p className="text-[11.5px] text-brand-muted">
            {fmtDateLong(selectedDate)}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            nav(`/журнал/новый-ивент?date=${selectedDate}`)
          }
        >
          <Plus size={14} />
          Добавить ивент
        </Button>
      </div>

      <div className="space-y-2">
        {dayItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-brand-line bg-brand-mint/40 p-4 text-center text-[12.5px] text-brand-muted">
            На этот день событий нет. Нажмите «+ Добавить ивент» или
            наведите на день в календаре.
          </div>
        )}

        {dayItems.map((it) => {
          if (it.kind === "note") {
            return (
              <div
                key={it.id}
                className="relative flex items-stretch gap-3 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-left"
              >
                <span className="absolute left-0 top-0 h-full w-1 bg-amber-400" />
                <div className="ml-1 flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                    <StickyNote size={11} />
                    {fmtTime(it.time)} · Заметка
                  </div>
                  <div className="text-sm font-bold text-brand-deep">
                    {it.title}
                  </div>
                  {it.comment && (
                    <div className="mt-0.5 line-clamp-2 text-[12px] text-brand-muted">
                      {it.comment}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Группа ивентов одного типа: одна строка-агрегатор.
          // Клик по стаку ведёт на ленту дня с фильтром по типу,
          // одиночный ивент — сразу на карточку (без раскрывающегося списка).
          const groupKey = `${it.type}|${it.time}`;
          const head = it.items[0];
          const completed = it.items.every((e) => e.status === "completed");
          const isStack = it.items.length > 1;
          const showCount = isStack || it.type === "slide";
          const groupLabel = showCount
            ? `${eventTypeLabel[it.type]} · ${it.items.length} шт.`
            : head.title;

          return (
            <div
              key={groupKey}
              className={classNames(
                "relative overflow-hidden rounded-xl border bg-white",
                completed
                  ? "border-brand-line opacity-60"
                  : "border-brand-line"
              )}
            >
              <span
                className={classNames(
                  "absolute left-0 top-0 h-full w-1",
                  completed ? "bg-brand-line" : eventLeftBar[it.type]
                )}
              />
              <button
                onClick={() => {
                  if (isStack) {
                    nav(`/журнал/день/${selectedDate}?type=${it.type}`);
                  } else {
                    nav(`/журнал/ивент/${head.id}`);
                  }
                }}
                className="flex w-full items-stretch gap-3 p-3 text-left transition hover:bg-brand-mint/40"
              >
                <div className="ml-1 flex-1">
                  <div
                    className={classNames(
                      "text-[11px] font-semibold uppercase tracking-wider text-brand-muted",
                      completed && "line-through"
                    )}
                  >
                    {fmtTime(it.time)}
                  </div>
                  <div
                    className={classNames(
                      "text-sm font-bold text-brand-deep",
                      completed && "line-through"
                    )}
                  >
                    {groupLabel}
                  </div>
                  {!isStack && head.comment && (
                    <div className="mt-0.5 text-[12px] text-brand-muted">
                      {head.comment}
                    </div>
                  )}
                </div>
                <span className="grid h-7 w-7 shrink-0 place-items-center self-center rounded-full text-brand-muted">
                  <ChevronRight size={14} />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

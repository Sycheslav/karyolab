import { useNavigate } from "react-router-dom";
import { Plus, StickyNote } from "lucide-react";
import { useStore } from "@/lib/store";
import { useMemo } from "react";
import { parseISO, startOfDay } from "date-fns";
import { eventLeftBar } from "@/components/calendar/eventColors";
import { classNames, fmtDateLong, fmtTime, isoDay } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function TodayEvents() {
  const events = useStore((s) => s.events);
  const notes = useStore((s) => s.notes);
  const selectedDate = useStore((s) => s.selectedDate);
  const nav = useNavigate();

  const dayItems = useMemo(() => {
    const d = startOfDay(parseISO(selectedDate));
    const evs = events
      .filter((ev) => {
        const s = startOfDay(parseISO(ev.startDate));
        const e = startOfDay(parseISO(ev.endDate ?? ev.startDate));
        return d >= s && d <= e;
      })
      .map((ev) => ({
        kind: "event" as const,
        id: ev.id,
        time: ev.startDate,
        title: ev.title,
        comment: ev.comment,
        type: ev.type,
        completed: ev.status === "completed",
      }));

    // По 08_заметки_и_тильт.md: заметки не отображаются в календаре,
    // но появляются в событиях выбранного дня.
    const dayNotes = notes
      .filter((n) => !n.archived && isoDay(n.createdAt) === selectedDate)
      .map((n) => ({
        kind: "note" as const,
        id: n.id,
        time: n.createdAt,
        title: n.title,
        comment: n.body,
      }));

    return [...evs, ...dayNotes].sort(
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

          const completed = it.completed;
          return (
            <button
              key={it.id}
              onClick={() => nav(`/журнал/ивент/${it.id}`)}
              className={classNames(
                "relative flex w-full items-stretch gap-3 overflow-hidden rounded-xl border bg-white p-3 text-left transition hover:bg-brand-mint/40",
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
                  {it.title}
                </div>
                {it.comment && (
                  <div className="mt-0.5 text-[12px] text-brand-muted">
                    {it.comment}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

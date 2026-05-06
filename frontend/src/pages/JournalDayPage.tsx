import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { isoDay, fmtDateLong, classNames } from "@/lib/utils";
import type { EventType, JournalEvent } from "@/lib/types";

const TYPE_LABEL: Record<EventType, string> = {
  germination: "Проращивание",
  slide: "Создание препарата",
  wash: "Отмывка",
  hybridization: "Гибридизация",
  photographing: "Фотографирование",
  free: "Свободный ивент",
};

/**
 * Лента всех ивентов выбранного дня (`/журнал/день/:date`).
 * Поддерживает фильтр по типу через `?type=slide` — туда мы попадаем
 * со стака календаря (`05_роутинг_и_навигация.md`, правка 2 в плане).
 */
export default function JournalDayPage() {
  const { date } = useParams<{ date: string }>();
  const [params] = useSearchParams();
  const nav = useNavigate();

  const events = useStore((s) => s.events);
  const dayKey = date ?? isoDay(new Date());
  const typeFilter = (params.get("type") as EventType | null) ?? null;

  const dayEvents = useMemo(() => {
    return events
      .filter((e) => isoDay(e.startDate) === dayKey)
      .filter((e) => (typeFilter ? e.type === typeFilter : true))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, dayKey, typeFilter]);

  const groupsByType = useMemo(() => {
    const m = new Map<EventType, JournalEvent[]>();
    for (const e of dayEvents) {
      const arr = m.get(e.type) ?? [];
      arr.push(e);
      m.set(e.type, arr);
    }
    return m;
  }, [dayEvents]);

  const dateObj = new Date(`${dayKey}T00:00:00`);
  const titleLong = fmtDateLong(dateObj);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Журнал", to: "/журнал" },
          { label: titleLong },
        ]}
      />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calendar size={22} className="text-brand-dark" />
          <div>
            <h1 className="heading-page">{titleLong}</h1>
            <p className="mt-1 text-[13px] text-brand-muted">
              {typeFilter
                ? `Ивенты типа: ${TYPE_LABEL[typeFilter]}`
                : `Все ивенты дня · ${dayEvents.length} шт.`}
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => nav("/журнал")}>
          <ArrowLeft size={14} /> К календарю
        </Button>
      </header>

      {typeFilter && (
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-brand-muted">
            Фильтр по типу:
          </span>
          <Badge tone="mint">{TYPE_LABEL[typeFilter]}</Badge>
          <button
            onClick={() => nav(`/журнал/день/${dayKey}`)}
            className="text-[12px] font-semibold text-brand-dark hover:underline"
          >
            показать всё
          </button>
        </div>
      )}

      {dayEvents.length === 0 ? (
        <EmptyState
          icon={<Calendar size={32} />}
          title="В этот день ничего не записано"
          description="Можно добавить ивент или открыть другой день."
          action={
            <Button onClick={() => nav("/журнал/новый-ивент")}>
              Создать ивент
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {Array.from(groupsByType.entries()).map(([type, list]) => (
            <section key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-brand-deep">
                  {TYPE_LABEL[type]}
                </h2>
                <span className="text-[11px] uppercase tracking-wider text-brand-muted">
                  {list.length} шт.
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {list.map((e) => (
                  <Card
                    key={e.id}
                    className={classNames(
                      "cursor-pointer p-3 transition hover:shadow-soft"
                    )}
                    onClick={() => nav(`/журнал/ивент/${e.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-semibold text-brand-deep">
                          {e.title}
                        </div>
                        {e.comment && (
                          <div className="mt-1 truncate text-[12px] text-brand-muted">
                            {e.comment}
                          </div>
                        )}
                      </div>
                      <Badge tone="default">
                        {new Date(e.startDate).toLocaleTimeString("ru", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Badge>
                    </div>
                    {e.operator && (
                      <div className="mt-2 text-[11px] text-brand-muted">
                        Оператор: {e.operator}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

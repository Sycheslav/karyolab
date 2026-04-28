import { useEffect, useMemo, useState } from "react";
import { Check, Play, Sprout } from "lucide-react";
import EventCardShell from "./EventCardShell";
import type { GerminationEvent } from "@/lib/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { addHours, format, parseISO } from "date-fns";
import { classNames } from "@/lib/utils";

interface Props {
  event: GerminationEvent;
}

interface Step {
  id: number;
  title: string;
  note: string;
  /** Через сколько часов от стартовой даты этап завершается (для авто-расчёта). */
  hoursFromStart?: number;
  /** Этап имеет редактируемую дату вручную (первые три). */
  editable?: boolean;
}

const STEPS: Step[] = [
  {
    id: 0,
    title: "Закладка семян",
    note: "Начало экспериментального цикла",
    editable: true,
  },
  {
    id: 1,
    title: "Перенос в холодильник",
    note: "Период стратификации",
    editable: true,
  },
  {
    id: 2,
    title: "Перенос в термостат",
    note: "Длительность: 2 ч",
    editable: true,
  },
  {
    id: 3,
    title: "Обработка HU",
    note: "Жёсткий интервал: 18 ч",
    hoursFromStart: 20,
  },
  {
    id: 4,
    title: "Отмывка и доращивание",
    note: "Жёсткий интервал: 5 ч",
    hoursFromStart: 25,
  },
  {
    id: 5,
    title: "Фиксация в холодильнике",
    note: "Интервал: 24 ч. Создать растения.",
    hoursFromStart: 49,
  },
  {
    id: 6,
    title: "Созревание и хранение",
    note: "Ожидаемая дата завершения",
    hoursFromStart: 14 * 24,
  },
];

export default function EventCardGermination({ event }: Props) {
  const nav = useNavigate();
  const samples = useStore((s) =>
    s.samples.filter((sm) => event.sampleIds.includes(sm.id))
  );
  const updateEvent = useStore((s) => s.updateEvent);

  // Локальные даты первых трёх этапов. По умолчанию — берём из startDate /
  // endDate ивента. Когда пользователь редактирует — пишем в стор через updateEvent.
  const initialStepDates = useMemo<Record<number, string>>(
    () => ({
      0: event.startDate.slice(0, 10),
      1: event.startDate.slice(0, 10),
      2: event.startDate.slice(0, 10),
    }),
    [event.startDate]
  );
  const [stepDates, setStepDates] =
    useState<Record<number, string>>(initialStepDates);

  useEffect(() => {
    setStepDates(initialStepDates);
  }, [initialStepDates]);

  function setStepDate(id: number, value: string) {
    setStepDates((s) => ({ ...s, [id]: value }));
    if (id === 0) {
      // Дата нулевого этапа влияет на startDate всего ивента.
      const time = event.startDate.slice(11) || "09:00:00";
      updateEvent(event.id, { startDate: `${value}T${time}` });
    }
  }

  // Для отображения «следующих дат» — рассчитываем от первой даты (или
  // последней редактируемой) и шагов, у которых задан hoursFromStart.
  const baseDate = useMemo(() => {
    return parseISO(`${stepDates[0]}T${event.startDate.slice(11) || "09:00:00"}`);
  }, [stepDates, event.startDate]);

  return (
    <EventCardShell
      event={event}
      crumbs={[
        { label: "Журнал", to: "/журнал" },
        { label: "Проращивание" },
        { label: event.batchName },
      ]}
      side={
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-brand-deep">
              Образцы партии
            </h3>
            <Badge tone="default">{samples.length}</Badge>
          </div>
          <div className="mt-3 space-y-2">
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => nav(`/журнал/образец/${s.id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-brand-line bg-white p-3 text-left transition hover:bg-brand-mint/40"
              >
                <div>
                  <div className="text-sm font-extrabold text-brand-deep">
                    S-{s.id}
                  </div>
                  <div className="text-[11.5px] text-brand-muted">
                    {s.species}
                  </div>
                </div>
                <Badge tone="mint">Открыть</Badge>
              </button>
            ))}
            {samples.length === 0 && (
              <div className="rounded-xl border border-dashed border-brand-line p-3 text-center text-[12.5px] text-brand-muted">
                Образцы не добавлены.
              </div>
            )}
          </div>
        </Card>
      }
    >
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="label-cap">Текущий статус</div>
            <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-brand-accent/20 px-3 py-1 text-[12.5px] font-semibold text-brand-dark">
              <span className="h-2 w-2 rounded-full bg-brand-accent" />
              Активно
            </div>
          </div>
          <div className="text-right">
            <div className="label-cap">Срок завершения</div>
            <div className="mt-1 text-base font-bold text-brand-deep">
              ≈ {event.estimatedDays} дней от старта
            </div>
          </div>
          <Button variant="danger">Завершить ивент</Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-brand-deep">
            <Sprout size={15} className="mr-1.5 inline text-brand" />
            Таймлайн под-ивентов
          </h3>
          <span className="text-[11px] italic text-brand-muted">
            Все изменения логируются системой
          </span>
        </div>
        <ol className="relative mt-4 space-y-1 pl-2">
          {STEPS.map((step, idx) => {
            const completed = idx < event.currentStep;
            const current = idx === event.currentStep;
            // Заказчик: «Создать растения» только на этапе «Фиксация» (id=5),
            // а не на любом текущем (правка 10.1).
            const showCreatePlants = current && step.id === 5;
            const editableDate = step.editable === true;
            const autoDate =
              step.hoursFromStart != null
                ? addHours(baseDate, step.hoursFromStart)
                : null;
            return (
              <li
                key={step.id}
                className="flex flex-wrap items-start gap-3 rounded-xl px-3 py-3"
              >
                <span
                  className={classNames(
                    "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2",
                    completed
                      ? "border-brand bg-brand text-white"
                      : current
                        ? "border-brand-accent bg-brand-accent text-brand-deep"
                        : "border-brand-line bg-white text-brand-muted"
                  )}
                >
                  {completed ? (
                    <Check size={14} />
                  ) : current ? (
                    <Play size={12} />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <div
                  className={classNames(
                    "min-w-0 flex-1 rounded-xl px-3 py-2",
                    current && "bg-brand-accent/15 border border-brand-accent/40"
                  )}
                >
                  <div
                    className={classNames(
                      "text-sm font-bold",
                      completed
                        ? "text-brand-deep"
                        : current
                          ? "text-brand-deep"
                          : "text-brand-muted"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-[11.5px] text-brand-muted">{step.note}</div>
                </div>
                {editableDate ? (
                  // Первые три этапа — пользовательский ввод даты (правка 10.2).
                  <input
                    type="date"
                    value={stepDates[step.id] ?? ""}
                    onChange={(e) => setStepDate(step.id, e.target.value)}
                    className="rounded-md border border-brand-line bg-white px-2.5 py-1 text-[12px] font-semibold text-brand-deep"
                    title="Изменить дату этапа"
                  />
                ) : autoDate ? (
                  // Авто-расчёт «следующих дат» от стартовой (правка 10.4).
                  <span className="rounded-md bg-brand-mint/40 px-2.5 py-1 text-[10.5px] font-semibold uppercase text-brand-muted">
                    Авто-расчёт · {format(autoDate, "dd.MM HH:mm")}
                  </span>
                ) : null}
                {showCreatePlants && (
                  <Button size="sm" variant="primary">
                    Создать растения
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
      </Card>
    </EventCardShell>
  );
}

import { Check, Play, Sprout } from "lucide-react";
import EventCardShell from "./EventCardShell";
import type { GerminationEvent } from "@/lib/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { classNames } from "@/lib/utils";

interface Props {
  event: GerminationEvent;
}

const STEPS = [
  { id: 0, title: "Закладка семян", note: "Начало экспериментального цикла" },
  { id: 1, title: "Перенос в холодильник", note: "Период стратификации" },
  { id: 2, title: "Перенос в термостат", note: "Длительность: 2 ч" },
  { id: 3, title: "Обработка HU", note: "Жёсткий интервал: 18 ч" },
  { id: 4, title: "Отмывка и доращивание", note: "Жёсткий интервал: 5 ч" },
  {
    id: 5,
    title: "Фиксация в холодильнике",
    note: "Интервал: 24 ч. Создать растения.",
  },
  { id: 6, title: "Созревание и хранение", note: "Ожидаемая дата завершения" },
];

export default function EventCardGermination({ event }: Props) {
  const nav = useNavigate();
  const samples = useStore((s) =>
    s.samples.filter((sm) => event.sampleIds.includes(sm.id))
  );

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
                {idx <= 2 && completed && (
                  <span className="rounded-md border border-brand-line bg-white px-2.5 py-1 text-[11.5px] font-semibold text-brand-dark">
                    {event.startDate.slice(0, 10)}
                  </span>
                )}
                {idx > 2 && !completed && (
                  <span className="rounded-md bg-brand-mint/40 px-2.5 py-1 text-[10.5px] font-semibold uppercase text-brand-muted">
                    Авто-расчёт
                  </span>
                )}
                {current && (
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

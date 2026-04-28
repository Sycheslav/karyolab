import EventCardShell from "./EventCardShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import type { PhotographingEvent } from "@/lib/types";
import { Refrigerator, AlertTriangle, ArrowRight, FileInput } from "lucide-react";
import Button from "@/components/ui/Button";

interface Props {
  event: PhotographingEvent;
}

export default function EventCardPhoto({ event }: Props) {
  const nav = useNavigate();
  const stained = useStore((s) => s.stained);
  const preps = useStore((s) => s.preparations);

  const total = event.stainedDecisions.length;
  const washed = event.stainedDecisions.filter((d) => d.fate === "washed").length;
  const discarded = total - washed;

  return (
    <EventCardShell
      event={event}
      crumbs={[
        { label: "Журнал", to: "/журнал" },
        { label: "Фотографирование" },
        { label: event.title },
      ]}
      side={
        <>
          <Card accent>
            <h3 className="text-[14px] font-bold text-brand-deep">
              Сводка ивента
            </h3>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12.5px] text-brand-muted">
                Сфотографировано
              </span>
              <span className="text-[24px] font-extrabold text-brand-deep">
                {String(total).padStart(2, "0")}
              </span>
            </div>
            {total > 0 && (
              <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-line">
                <div
                  className="absolute left-0 top-0 h-full bg-brand-accent"
                  style={{ width: `${(washed / total) * 100}%` }}
                />
                <div
                  className="absolute top-0 h-full bg-brand-danger"
                  style={{
                    left: `${(washed / total) * 100}%`,
                    width: `${(discarded / total) * 100}%`,
                  }}
                />
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-brand-line bg-white p-2.5 text-center">
                <div className="label-cap">К повторной гибридизации</div>
                <div className="text-[20px] font-extrabold text-brand-deep">
                  {String(washed).padStart(2, "0")}
                </div>
              </div>
              <div className="rounded-xl border border-brand-danger/40 bg-brand-danger/10 p-2.5 text-center">
                <div className="label-cap text-brand-danger">Выброшено</div>
                <div className="text-[20px] font-extrabold text-brand-danger">
                  {String(discarded).padStart(2, "0")}
                </div>
              </div>
            </div>

            {washed > 0 && (
              <Button
                variant="dark"
                size="sm"
                className="mt-3 w-full"
                onClick={() =>
                  nav(`/журнал/новый-ивент?type=hybridization`)
                }
              >
                <ArrowRight size={13} />
                Поставить новую гибридизацию
              </Button>
            )}
            {total > 0 && (
              <Button
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  const first = event.stainedDecisions[0];
                  const st = stained.find((x) => x.id === first.stainedId);
                  const prep = preps.find((p) => p.id === st?.preparationId);
                  const qs = new URLSearchParams();
                  if (st) qs.set("stainedId", st.id);
                  if (prep) {
                    qs.set("sampleId", prep.sampleId);
                    qs.set("prepId", prep.id);
                  }
                  nav(`/кариотип/импорт?${qs.toString()}`);
                }}
              >
                <FileInput size={13} />
                Открыть импорт фото
              </Button>
            )}
          </Card>

          <Card>
            <h3 className="text-[14px] font-bold text-brand-deep">
              Параметры сессии
            </h3>
            <div className="mt-3 space-y-2 text-[12.5px]">
              <div>
                <div className="label-cap">Название сессии</div>
                <div className="font-semibold text-brand-deep">
                  {event.title}
                </div>
              </div>
              <div>
                <div className="label-cap">Дата фотографирования</div>
                <div className="font-semibold text-brand-deep">
                  {event.startDate.slice(0, 10)} · {event.startDate.slice(11, 16)}
                  {event.endDate && ` – ${event.endDate.slice(11, 16)}`}
                </div>
              </div>
              <div>
                <div className="label-cap">Оператор</div>
                <div className="font-semibold text-brand-deep">
                  {event.operator}
                </div>
              </div>
            </div>
          </Card>
        </>
      }
    >
      <Card>
        <h3 className="text-[15px] font-bold text-brand-deep">
          Что изменилось
        </h3>
        <p className="mt-1 text-[12.5px] text-brand-muted">
          Каждой окраске присвоен статус «сфотографирован». Физический
          препарат получил дальнейшую судьбу: постгибридизационная отмывка
          для повторной работы или выбрасывание.
        </p>
      </Card>

      <Card>
        <h3 className="text-[15px] font-bold text-brand-deep">
          Сфотографированные окраски
        </h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-brand-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-deep text-brand-cream">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  ID окраски
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Образец
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Решение
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Хранение / итог
                </th>
              </tr>
            </thead>
            <tbody>
              {event.stainedDecisions.map((d) => {
                const st = stained.find((x) => x.id === d.stainedId);
                const prep = preps.find((p) => p.id === st?.preparationId);
                const isDisc = d.fate === "discarded";
                return (
                  <tr key={d.stainedId} className="border-t border-brand-line">
                    <td className="px-3 py-2.5 font-semibold text-brand-deep">
                      {d.stainedId}
                    </td>
                    <td className="px-3 py-2.5">
                      {prep ? (
                        <button
                          onClick={() =>
                            nav(`/журнал/образец/${prep.sampleId}`)
                          }
                          className="font-semibold text-brand-dark hover:underline"
                        >
                          S-{prep.sampleId}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone={isDisc ? "red" : "mint"}>
                        {isDisc ? "Выброшен" : "Постгиб. отмыт"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {isDisc ? (
                        <span className="inline-flex items-center gap-1.5 text-brand-danger">
                          <AlertTriangle size={14} />
                          Стекло закрыто
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-brand-deep">
                          <Refrigerator size={13} className="text-brand" />
                          {d.newFridge ?? "—"} · {d.newBox ?? "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </EventCardShell>
  );
}

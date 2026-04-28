import EventCardShell from "./EventCardShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { HybridizationEvent } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { classNames } from "@/lib/utils";
import { FlaskConical, AlertTriangle } from "lucide-react";

interface Props {
  event: HybridizationEvent;
}

const channelStyle = (c: "red" | "green" | "blue") =>
  c === "red"
    ? "bg-brand-danger/15 text-brand-danger border-brand-danger/30"
    : c === "green"
      ? "bg-brand-accent/30 text-brand-dark border-brand-accent/50"
      : "bg-blue-100 text-blue-800 border-blue-200";

export default function EventCardHybridization({ event }: Props) {
  const nav = useNavigate();
  const preps = useStore((s) =>
    s.preparations.filter((p) => event.preparationIds.includes(p.id))
  );

  return (
    <EventCardShell
      event={event}
      crumbs={[
        { label: "Журнал", to: "/журнал" },
        { label: "Гибридизация" },
        { label: event.batchName },
      ]}
      side={
        <Card>
          <div className="flex items-center gap-2">
            <FlaskConical size={15} className="text-brand-dark" />
            <h3 className="text-[14px] font-bold text-brand-deep">
              Зонды и каналы
            </h3>
          </div>
          <div className="mt-3 space-y-2">
            {event.probes.length === 0 && (
              <div className="rounded-lg border border-dashed border-brand-line px-2.5 py-2 text-[12px] text-brand-muted">
                Зонды не указаны.
              </div>
            )}
            {event.probes.map((p, i) => (
              <div
                key={i}
                className={classNames(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-1.5",
                  channelStyle(p.channel)
                )}
              >
                <span className="font-bold">●</span>
                <span className="text-[12.5px] font-semibold">{p.name}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider">
                  {p.channel === "red"
                    ? "красный"
                    : p.channel === "green"
                      ? "зелёный"
                      : "синий"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      }
    >
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-brand-deep">
            Гибридизация — 48 часов
          </h3>
          <Badge tone="mint">⏱ 2 дня</Badge>
        </div>
        <div className="label-cap mt-3">Прогресс цикла</div>
        <div className="mt-2 h-2 w-full rounded-full bg-brand-line">
          <div className="h-full w-1/2 rounded-full bg-brand-accent" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-accent/40 bg-brand-accent/10 p-3">
            <div className="label-cap text-brand-dark">День 1: инкубация</div>
            <p className="mt-1 text-[12.5px] text-brand-deep/85">
              Связывание зондов и термостабилизация.
            </p>
          </div>
          <div className="rounded-xl border border-brand-line bg-white p-3">
            <div className="label-cap">День 2: пост-отмывка</div>
            <p className="mt-1 text-[12.5px] text-brand-muted">
              Стрингентные отмывки и фиксация флюорохромов.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-[15px] font-bold text-brand-deep">
          Окрашенные препараты
        </h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-brand-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-deep text-brand-cream">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  ID препарата
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Образец
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Цикл окраски
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Прогресс
                </th>
              </tr>
            </thead>
            <tbody>
              {preps.map((p) => {
                const cycle = (p.stainCycle ?? 0) + 1;
                const isLast = cycle === 3;
                return (
                  <tr key={p.id} className="border-t border-brand-line">
                    <td className="px-3 py-2.5 font-semibold text-brand-deep">
                      {p.id}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => nav(`/журнал/образец/${p.sampleId}`)}
                        className="font-semibold text-brand-dark hover:underline"
                      >
                        S-{p.sampleId}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone={isLast ? "amber" : "default"}>
                        Окраска {cycle}
                        {isLast && (
                          <span className="ml-1 inline-flex items-center gap-0.5">
                            <AlertTriangle size={10} /> последняя
                          </span>
                        )}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-semibold">День 1 из 2</td>
                  </tr>
                );
              })}
              {preps.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-5 text-center text-brand-muted"
                  >
                    Препараты не выбраны.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </EventCardShell>
  );
}

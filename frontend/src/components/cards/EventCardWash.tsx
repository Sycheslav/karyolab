import EventCardShell from "./EventCardShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { WashEvent } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Refrigerator } from "lucide-react";

interface Props {
  event: WashEvent;
}

export default function EventCardWash({ event }: Props) {
  const nav = useNavigate();
  const preps = useStore((s) =>
    s.preparations.filter((p) => event.preparationIds.includes(p.id))
  );

  // Правка 15: уникальные sampleId партии и сколько препаратов от каждого образца
  // вошло в эту партию (для блока «Образцы партии» в сайдбаре).
  const batchSamples = (() => {
    const map = new Map<string, number>();
    for (const p of preps) {
      map.set(p.sampleId, (map.get(p.sampleId) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => a.id.localeCompare(b.id));
  })();

  return (
    <EventCardShell
      event={event}
      crumbs={[
        { label: "Журнал", to: "/журнал" },
        { label: "Предгибридизационная отмывка" },
        { label: event.title },
      ]}
      side={
        <>
          <Card accent>
            <h3 className="text-[14px] font-bold text-brand-deep">
              Сводка партии
            </h3>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12.5px] text-brand-muted">Препаратов</span>
              <span className="text-[24px] font-extrabold text-brand-deep">
                {String(preps.length).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-[12.5px]">
              <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5">
                <span className="text-brand-muted">Новый холодильник</span>
                <span className="font-bold text-brand-deep">
                  {event.newFridge ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5">
                <span className="text-brand-muted">Новая коробка</span>
                <span className="font-bold text-brand-deep">
                  {event.newBox ?? "—"}
                </span>
              </div>
            </div>
          </Card>

          {/* Правка 15: уникальные образцы партии — со счётчиком и ссылкой. */}
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-brand-deep">
                Образцы партии
              </h3>
              <Badge tone="default">{batchSamples.length}</Badge>
            </div>
            <div className="mt-3 space-y-1.5">
              {batchSamples.map((bs) => (
                <button
                  key={bs.id}
                  onClick={() => nav(`/журнал/образец/${bs.id}`)}
                  className="flex w-full items-center justify-between rounded-xl border border-brand-line bg-white px-3 py-2 text-left transition hover:bg-brand-mint/40"
                >
                  <span className="text-sm font-extrabold text-brand-deep">
                    S-{bs.id}
                  </span>
                  <span className="text-[11.5px] text-brand-muted">
                    {bs.count} преп.
                  </span>
                </button>
              ))}
              {batchSamples.length === 0 && (
                <div className="rounded-xl border border-dashed border-brand-line p-2 text-center text-[12px] text-brand-muted">
                  В партии нет препаратов.
                </div>
              )}
            </div>
          </Card>
        </>
      }
    >
      <Card>
        <h3 className="text-[15px] font-bold text-brand-deep">
          Что изменилось — отмыто {preps.length} препаратов
        </h3>
        <p className="mt-1 text-[12.5px] text-brand-muted">
          Препараты получили статус «предгибридизационно отмыт» и новое место
          хранения.
        </p>
      </Card>

      <Card>
        <div className="overflow-hidden rounded-xl border border-brand-line">
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
                  Качество
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Новое место хранения
                </th>
              </tr>
            </thead>
            <tbody>
              {preps.map((p) => (
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
                    <Badge
                      tone={
                        p.quality === "low"
                          ? "red"
                          : p.quality === "medium"
                            ? "amber"
                            : "mint"
                      }
                    >
                      {p.quality === "high"
                        ? "Высокое"
                        : p.quality === "medium"
                          ? "Среднее"
                          : "Низкое"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-brand-deep">
                    <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                      <Refrigerator size={13} className="text-brand" />
                      {event.newFridge ?? p.fridge ?? "—"} ·{" "}
                      {event.newBox ?? p.box ?? "—"}
                    </span>
                  </td>
                </tr>
              ))}
              {preps.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-brand-muted">
                    Препараты не выбраны.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {event.protocolNotes && (
        <Card>
          <h3 className="text-[15px] font-bold text-brand-deep">Протокольная заметка</h3>
          <p className="mt-2 whitespace-pre-line text-[13px] text-brand-deep/85">
            {event.protocolNotes}
          </p>
        </Card>
      )}
    </EventCardShell>
  );
}

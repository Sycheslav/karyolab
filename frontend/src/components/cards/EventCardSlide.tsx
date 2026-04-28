import EventCardShell from "./EventCardShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import type { SlideEvent } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

interface Props {
  event: SlideEvent;
}

export default function EventCardSlide({ event }: Props) {
  const nav = useNavigate();
  const preps = useStore((s) =>
    s.preparations.filter((p) => event.preparationIds.includes(p.id))
  );
  const plants = useStore((s) => s.plants);

  return (
    <EventCardShell
      event={event}
      crumbs={[
        { label: "Журнал", to: "/журнал" },
        { label: "Создание препарата" },
        { label: event.title },
      ]}
      side={
        <Card dark>
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-cream/70">
            Создано препаратов
          </div>
          <div className="mt-2 text-[42px] font-extrabold text-white">
            {String(preps.length).padStart(2, "0")}
          </div>
        </Card>
      }
    >
      <Card>
        <div className="overflow-hidden rounded-xl border border-brand-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-deep text-brand-cream">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Образец
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Источник
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Качество
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Хранение
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Комментарий
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {preps.map((p) => (
                <tr key={p.id} className="border-t border-brand-line">
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => nav(`/журнал/образец/${p.sampleId}`)}
                      className="font-semibold text-brand-dark hover:underline"
                    >
                      S-{p.sampleId}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-brand-deep/80">
                    {(() => {
                      const ps = p.source;
                      if (ps.kind === "mix") return "Смесь растений";
                      return (
                        plants.find((pl) => pl.id === ps.plantId)?.name ??
                        ps.plantId
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge
                      tone={
                        p.quality === "high"
                          ? "mint"
                          : p.quality === "medium"
                            ? "amber"
                            : "red"
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
                    {p.fridge ?? "—"}, {p.box ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-brand-muted italic">
                    {p.comment ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      className="text-brand-muted hover:text-brand-deep"
                      title="Редактировать"
                    >
                      <Pencil size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {preps.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-brand-muted"
                  >
                    Нет препаратов в ивенте.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {event.comment && (
        <Card>
          <p className="text-[13px] text-brand-deep">{event.comment}</p>
        </Card>
      )}
    </EventCardShell>
  );
}

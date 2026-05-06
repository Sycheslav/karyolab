import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Beaker, Info, AlertTriangle } from "lucide-react";
import { formatStainHistoryShort, useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";
import ProbeSelector from "./ProbeSelector";
import type { ProbeChannel } from "@/lib/types";
import { classNames, defaultBatchName, isoDay } from "@/lib/utils";

interface Props {
  defaultDate?: string;
}

export default function HybridizationForm({ defaultDate }: Props) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const createHybridizationEvent = useStore(
    (s) => s.createHybridizationEvent
  );
  const preps = useStore((s) => s.preparations);
  const stained = useStore((s) => s.stained);
  const events = useStore((s) => s.events);

  // Допустимые препараты: «предгибридизационно отмыт» или «готов к
  // повторной гибридизации». 04_ивенты.md / 06_экраны.
  const eligible = useMemo(
    () => preps.filter((p) => p.status === "pre_washed" || p.status === "rehyb_ready"),
    [preps]
  );

  // Препараты, у которых уже было 3 окраски — недоступны для новой.
  const blockedByCycles = useMemo(
    () => preps.filter((p) => (p.stainCycle ?? 0) >= 3),
    [preps]
  );

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState(
    defaultDate ?? new Date().toISOString().slice(0, 10)
  );
  // Дефолт `HYB-{YYYY-MM-DD}` (правка 14).
  const sameDayCount = useMemo(
    () =>
      events.filter(
        (e) => e.type === "hybridization" && isoDay(e.startDate) === date
      ).length,
    [events, date]
  );
  const [batchName, setBatchName] = useState(() =>
    defaultBatchName("hybridization", date, sameDayCount)
  );
  const [probes, setProbes] = useState<{ name: string; channel: ProbeChannel }[]>(
    []
  );

  // Поддержка предвыбора через ?prep=ID,...
  useEffect(() => {
    const pre = params.get("prep");
    if (!pre) return;
    const ids = pre.split(",").filter(Boolean);
    setSelected((s) => {
      const next = { ...s };
      for (const id of ids) {
        if (eligible.some((p) => p.id === id)) next[id] = true;
      }
      return next;
    });
  }, [params, eligible]);

  function save() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      toast.error("Выберите отмытые препараты");
      return;
    }
    if (probes.length === 0) {
      toast.error("Добавьте хотя бы один зонд");
      return;
    }
    const { eventId } = createHybridizationEvent({
      batchName,
      preparationIds: ids,
      probes,
      operator: "Лаборант",
      startDate: `${date}T10:00:00`,
      endDate: `${date}T10:00:00`,
    });
    toast.success("Ивент сохранён");
    nav(`/журнал/ивент/${eventId}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="heading-page">Создание гибридизации</h1>
      <p className="text-sm text-brand-muted">
        В таблице — только препараты со статусом «предгибридизационно отмыт»
        или «готов к повторной гибридизации». Длительность операции —{" "}
        <span className="font-semibold text-brand-deep">2 дня (48 часов)</span>.
      </p>

      <Card>
        <SectionTitle
          icon={<Beaker size={16} />}
          title="Препараты, готовые к гибридизации"
        />
        {eligible.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-brand-line bg-brand-mint/40 p-6 text-center text-sm text-brand-muted">
            Нет препаратов, готовых к гибридизации. Сначала проведите
            предгибридизационную отмывку или выберите препарат, готовый к
            повторной гибридизации.
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-brand-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-deep text-brand-cream">
                  <th className="w-10 px-3 py-2.5 text-left">#</th>
                  <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
                    ID препарата
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
                    Образец
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
                    След. окраска
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
                    История отмывок и зондов
                  </th>
                </tr>
              </thead>
              <tbody>
                {eligible.map((p) => {
                  const nextCycle = (p.stainCycle ?? 0) + 1;
                  const isLast = nextCycle === 3;
                  const isFromHyb = p.status === "rehyb_ready";
                  // Заказчик: для «отмыт от гибридизации» показываем
                  // компактную историю `1-GAA.pAs1.pAs119` …  (правка 16).
                  const history = stained
                    .filter((s) => s.preparationId === p.id)
                    .sort((a, b) => a.cycleNumber - b.cycleNumber);
                  const historyText = formatStainHistoryShort(history, "\n");
                  return (
                    <tr
                      key={p.id}
                      className={classNames(
                        "border-t border-brand-line align-top transition",
                        selected[p.id]
                          ? "bg-brand-cream/60"
                          : "bg-white hover:bg-brand-mint/40"
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={!!selected[p.id]}
                          onChange={() =>
                            setSelected((s) => ({ ...s, [p.id]: !s[p.id] }))
                          }
                          className="accent-brand-accent"
                          aria-label={`Выбрать ${p.id}`}
                        />
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-brand-deep">
                        {p.id}
                      </td>
                      <td className="px-3 py-2.5">S-{p.sampleId}</td>
                      <td className="px-3 py-2.5">
                        <Badge tone={isLast ? "amber" : "default"}>
                          Окраска {nextCycle}
                          {isLast ? " · последняя" : ""}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        {isFromHyb && historyText ? (
                          <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-brand-deep">
                            {historyText}
                          </pre>
                        ) : (
                          <Badge tone={isFromHyb ? "blue" : "mint"}>
                            {isFromHyb
                              ? "Отмыт от гибридизации"
                              : "Первично отмыт"}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {blockedByCycles.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-brand-warn/40 bg-amber-50 p-3 text-[12.5px] text-amber-900">
            <AlertTriangle size={14} className="mt-0.5" />
            <span>
              {blockedByCycles.length} препарат(ов) уже прошли 3 окраски и
              недоступны для новой гибридизации.
            </span>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle
          title="Зонды и каналы"
          hint="Зонды берутся из справочника атласа; канал подтягивается из флюорохрома, DAPI добавляется автоматически."
        />
        <div className="mt-4">
          <ProbeSelector value={probes} onChange={setProbes} />
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Название партии"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
          <Input
            label="Дата операции"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-line bg-brand-mint/40 px-3 py-2.5">
          <Info size={14} className="mt-0.5 text-brand-dark" />
          <p className="text-[12.5px] text-brand-deep">
            Гибридизация занимает{" "}
            <span className="font-semibold">2 дня (48 часов)</span>. Карточки
            окрашенных препаратов появятся сразу после сохранения.
          </p>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => history.back()}>
          Отмена
        </Button>
        <Button onClick={save}>Сохранить ивент</Button>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import Tag from "@/components/ui/Tag";
import { Plus, Info } from "lucide-react";
import type { ProbeChannel } from "@/lib/types";
import { classNames } from "@/lib/utils";

interface ProbePick {
  name: string;
  channel: ProbeChannel;
}

interface Props {
  value: ProbePick[];
  onChange: (probes: ProbePick[]) => void;
}

const channelLabel: Record<ProbeChannel, string> = {
  red: "красный",
  green: "зелёный",
  blue: "синий",
};

/**
 * Выбор зондов для гибридизации.
 *
 * Согласно `04_кариотип_концепция.md` и `атлас/03_зонды_и_флюорохромы.md`:
 *  - зонд выбирается строго из справочника атласа;
 *  - канал берётся автоматически из флюорохрома зонда — синий вручную
 *    не выбирается;
 *  - DAPI добавляется автоматически как контрокраска синего канала.
 */
export default function ProbeSelector({ value, onChange }: Props) {
  const atlasProbes = useStore((s) => s.atlasProbes);
  const fluorochromes = useStore((s) => s.fluorochromes);
  const [pickedId, setPickedId] = useState<string>("");

  const fluorById = useMemo(
    () => new Map(fluorochromes.map((f) => [f.id, f])),
    [fluorochromes]
  );

  // Зонды, доступные оператору: только не-контрокраски (красные/зелёные).
  const operatorProbes = useMemo(
    () =>
      atlasProbes.filter((p) => {
        const f = fluorById.get(p.fluorochromeId);
        return f && f.channel !== "blue";
      }),
    [atlasProbes, fluorById]
  );

  const dapiProbe = useMemo(
    () =>
      atlasProbes.find((p) => {
        const f = fluorById.get(p.fluorochromeId);
        return f && f.isCounterstain && f.channel === "blue";
      }),
    [atlasProbes, fluorById]
  );

  function add() {
    if (!pickedId) return;
    const probe = atlasProbes.find((p) => p.id === pickedId);
    const fluor = probe ? fluorById.get(probe.fluorochromeId) : undefined;
    if (!probe || !fluor) return;
    if (
      value.some((p) => p.name === probe.name && p.channel === fluor.channel)
    ) {
      setPickedId("");
      return;
    }
    onChange([...value, { name: probe.name, channel: fluor.channel }]);
    setPickedId("");
  }

  // DAPI всегда участвует в гибридизации как контрокраска;
  // оператор не управляет этим выбором.
  const probesWithDapi = useMemo<ProbePick[]>(() => {
    if (!dapiProbe) return value;
    const hasDapi = value.some(
      (p) => p.channel === "blue" && p.name === dapiProbe.name
    );
    if (hasDapi) return value;
    const f = fluorById.get(dapiProbe.fluorochromeId);
    if (!f) return value;
    return [...value, { name: dapiProbe.name, channel: f.channel }];
  }, [value, dapiProbe, fluorById]);

  function removeAt(idx: number) {
    const tag = probesWithDapi[idx];
    // DAPI убрать нельзя — это автоматическая контрокраска.
    if (dapiProbe && tag.name === dapiProbe.name && tag.channel === "blue")
      return;
    onChange(value.filter((p) => !(p.name === tag.name && p.channel === tag.channel)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1">
          <span className="label-cap mb-1.5 block">Зонд из справочника</span>
          <select
            className="field"
            value={pickedId}
            onChange={(e) => setPickedId(e.target.value)}
          >
            <option value="">— выберите зонд —</option>
            {operatorProbes.map((p) => {
              const f = fluorById.get(p.fluorochromeId);
              return (
                <option key={p.id} value={p.id}>
                  {p.name} · {f?.name ?? "?"} · {channelLabel[f?.channel ?? "red"]}
                </option>
              );
            })}
          </select>
        </div>

        <button
          type="button"
          onClick={add}
          disabled={!pickedId}
          className="inline-flex h-10 items-center gap-1 rounded-xl bg-brand px-4 text-[13px] font-semibold text-white shadow-soft transition hover:bg-brand-dark disabled:opacity-50"
        >
          <Plus size={14} />
          Добавить
        </button>
      </div>

      <div className="mt-2 flex items-start gap-2 rounded-lg border border-brand-line bg-brand-mint/40 px-3 py-2 text-[11.5px] text-brand-deep">
        <Info size={12} className="mt-0.5 text-brand-dark" />
        <span>
          Канал берётся из флюорохрома справочника. DAPI добавляется
          автоматически как синяя контрокраска и удалению не подлежит.
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {probesWithDapi.map((p, i) => {
          const isAutoDapi =
            dapiProbe &&
            p.name === dapiProbe.name &&
            p.channel === "blue";
          return (
            <Tag
              key={`${p.name}-${p.channel}-${i}`}
              tone={
                p.channel === "red"
                  ? "red"
                  : p.channel === "green"
                    ? "green"
                    : "blue"
              }
              onRemove={isAutoDapi ? undefined : () => removeAt(i)}
            >
              <span className="font-bold">●</span>
              {p.name}
              <span className="text-[10px] uppercase tracking-wider">
                {channelLabel[p.channel]}
                {isAutoDapi ? " · авто" : ""}
              </span>
            </Tag>
          );
        })}
        {value.length === 0 && (
          <span className="text-[12px] text-brand-muted">
            Добавьте зонды (например, pAs1, GAA). DAPI добавится сам.
          </span>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useStore } from "@/lib/store";
import Tag from "@/components/ui/Tag";
import { Plus } from "lucide-react";
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

const channels: ProbeChannel[] = ["red", "green", "blue"];

const channelStyle = (c: ProbeChannel) =>
  c === "red"
    ? "bg-brand-danger/15 text-brand-danger border-brand-danger/30"
    : c === "green"
      ? "bg-brand-accent/30 text-brand-dark border-brand-accent/50"
      : "bg-blue-100 text-blue-800 border-blue-200";

export default function ProbeSelector({ value, onChange }: Props) {
  const probes = useStore((s) => s.probes);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<ProbeChannel>("red");

  function add() {
    if (!name.trim()) return;
    if (value.some((p) => p.name === name.trim() && p.channel === channel)) {
      return;
    }
    onChange([...value, { name: name.trim(), channel }]);
    setName("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[160px] flex-1">
          <span className="label-cap mb-1.5 block">Зонд</span>
          <input
            list="probe-list"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder="напр. pAs1"
            className="field"
          />
          <datalist id="probe-list">
            {probes.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
        </div>

        <div>
          <span className="label-cap mb-1.5 block">Канал</span>
          <div className="inline-flex h-10 items-center gap-1 rounded-xl border border-brand-line bg-white p-1">
            {channels.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={classNames(
                  "h-7 px-2 rounded-md border text-[11px] font-bold uppercase transition",
                  channel === c
                    ? channelStyle(c)
                    : "border-transparent text-brand-muted hover:bg-brand-mint"
                )}
                title={
                  c === "red" ? "Красный" : c === "green" ? "Зелёный" : "Синий"
                }
              >
                {c === "red" ? "Кр" : c === "green" ? "Зл" : "Сн"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={add}
          className="inline-flex h-10 items-center gap-1 rounded-xl bg-brand px-4 text-[13px] font-semibold text-white shadow-soft hover:bg-brand-dark"
        >
          <Plus size={14} />
          Добавить
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {value.map((p, i) => (
          <Tag
            key={i}
            tone={
              p.channel === "red"
                ? "red"
                : p.channel === "green"
                  ? "green"
                  : "blue"
            }
            onRemove={() => onChange(value.filter((_, j) => j !== i))}
          >
            <span className="font-bold">●</span>
            {p.name}
            <span className="text-[10px] uppercase tracking-wider">
              {p.channel === "red"
                ? "красный"
                : p.channel === "green"
                  ? "зелёный"
                  : "синий"}
            </span>
          </Tag>
        ))}
        {value.length === 0 && (
          <span className="text-[12px] text-brand-muted">
            Добавьте зонды по каналам — например красный pAs1, зелёный GAA,
            синий DAPI.
          </span>
        )}
      </div>
    </div>
  );
}

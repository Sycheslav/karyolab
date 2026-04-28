import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { useStore } from "@/lib/store";
import Tag from "@/components/ui/Tag";
import { classNames } from "@/lib/utils";

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
}

export default function SampleMultiPicker({ value, onChange }: Props) {
  const samples = useStore((s) => s.samples);
  const [q, setQ] = useState("");

  const candidates = useMemo(() => {
    const ql = q.toLowerCase().trim();
    return samples.filter(
      (s) =>
        !value.includes(s.id) &&
        (!ql ||
          s.id.toLowerCase().includes(ql) ||
          s.species.toLowerCase().includes(ql))
    );
  }, [samples, q, value]);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-brand-line bg-white px-3 py-2.5">
        <Search size={14} className="text-brand-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по ID или виду…"
          className="w-full bg-transparent text-sm text-brand-deep outline-none placeholder:text-brand-muted/70"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="text-brand-muted"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {q && candidates.length > 0 && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-brand-line bg-white">
          {candidates.slice(0, 8).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onChange([...value, s.id]);
                setQ("");
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-brand-mint/40"
            >
              <span className="font-semibold text-brand-deep">S-{s.id}</span>
              <span className="text-[12px] text-brand-muted">{s.species}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {value.map((id) => {
          const s = samples.find((x) => x.id === id);
          return (
            <Tag key={id} onRemove={() => onChange(value.filter((v) => v !== id))}>
              S-{id}
              {s && (
                <span className="text-[10.5px] font-medium text-brand-dark/70">
                  {" · "}
                  {s.species}
                </span>
              )}
            </Tag>
          );
        })}
        <button
          type="button"
          className={classNames(
            "inline-flex items-center gap-1 rounded-full border border-dashed border-brand-line bg-white px-2.5 py-1 text-[12px] font-medium text-brand-muted transition hover:border-brand hover:text-brand-deep"
          )}
          onClick={() => {
            const first = candidates[0];
            if (first) onChange([...value, first.id]);
          }}
        >
          <Plus size={12} />
          Добавить ещё
        </button>
      </div>

      <div className="mt-2 text-[11.5px] uppercase tracking-wider text-brand-muted">
        {value.length} образцов выбрано
      </div>
    </div>
  );
}

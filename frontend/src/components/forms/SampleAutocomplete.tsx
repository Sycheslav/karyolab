import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";

interface Props {
  /** Значение — строка ID образца. */
  value: string;
  onChange: (id: string) => void;
  label?: string;
  placeholder?: string;
  /** Запретить кнопку «Создать пустой» (например, в редакторе родителя самого себя). */
  allowCreate?: boolean;
  /** ID, которые надо исключить (например, сам образец, чтобы не зациклить родителя). */
  excludeIds?: string[];
  className?: string;
}

/**
 * Single-select автокомплит выбора образца. Если введённого id нет — пункт
 * «+ Создать пустой образец «{q}»» создаёт черновик с этим id.
 *
 * Используется в `SampleForm` для полей «Мать» / «Отец» (правка 6.2).
 */
export default function SampleAutocomplete({
  value,
  onChange,
  label,
  placeholder = "ID образца или поиск…",
  allowCreate = true,
  excludeIds = [],
  className,
}: Props) {
  const samples = useStore((s) => s.samples);
  const addSample = useStore((s) => s.addSample);

  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Синхронизировать внешнее значение → строку поиска (если поле очищено снаружи).
  useEffect(() => {
    setQ(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const candidates = useMemo(() => {
    const ql = q.toLowerCase().trim();
    return samples
      .filter((s) => !excludeIds.includes(s.id))
      .filter(
        (s) =>
          !ql ||
          s.id.toLowerCase().includes(ql) ||
          s.species.toLowerCase().includes(ql) ||
          (s.name?.toLowerCase().includes(ql) ?? false)
      )
      .slice(0, 8);
  }, [samples, q, excludeIds]);

  const exact = samples.find((s) => s.id === q.trim());
  const showCreateOption =
    allowCreate &&
    q.trim().length > 0 &&
    !exact &&
    !excludeIds.includes(q.trim());

  function selectExisting(id: string) {
    onChange(id);
    setQ(id);
    setOpen(false);
  }

  function createEmpty() {
    const id = q.trim();
    if (!id) return;
    addSample({
      id,
      species: "—",
      status: "draft",
      createdAt: new Date().toISOString(),
    });
    toast.success(`Создан пустой образец S-${id}`);
    onChange(id);
    setQ(id);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className={classNames("relative block w-full", className)}>
      {label && <span className="label-cap mb-1.5 block">{label}</span>}
      <span className="field flex items-center gap-2 px-3.5 py-2.5">
        <Search size={14} className="text-brand-muted" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) onChange("");
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-brand-deep outline-none placeholder:text-brand-muted/70"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              onChange("");
              setOpen(true);
            }}
            className="text-brand-muted"
            aria-label="Очистить"
          >
            <X size={14} />
          </button>
        )}
      </span>

      {open && (candidates.length > 0 || showCreateOption) && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-brand-line bg-white shadow-soft">
          {candidates.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => selectExisting(s.id)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-brand-mint/40"
            >
              <span className="font-semibold text-brand-deep">S-{s.id}</span>
              <span className="text-[12px] text-brand-muted">{s.species}</span>
            </button>
          ))}
          {showCreateOption && (
            <button
              type="button"
              onClick={createEmpty}
              className="flex w-full items-center gap-2 border-t border-brand-line bg-brand-mint/40 px-3 py-2 text-left text-sm font-semibold text-brand-dark hover:bg-brand-mint"
            >
              <Plus size={14} />
              Создать пустой образец «{q.trim()}»
            </button>
          )}
        </div>
      )}
    </div>
  );
}

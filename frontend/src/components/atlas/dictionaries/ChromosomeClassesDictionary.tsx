import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";
import type { ChromosomeClassType } from "@/lib/types";
import DictionaryShell from "./DictionaryShell";
import ChromosomeClassCard from "./ChromosomeClassCard";

const FILTERS: { id: ChromosomeClassType | "all"; label: string }[] = [
  { id: "all", label: "все" },
  { id: "standard", label: "стандартные" },
  { id: "translocation", label: "транслокации" },
  { id: "substitution", label: "замещения" },
  { id: "foreign", label: "чужеродные" },
  { id: "derivative", label: "деривативные" },
];

export default function ChromosomeClassesDictionary() {
  const classes = useStore((s) => s.chromosomeClasses);
  const subgenomes = useStore((s) => s.subgenomes);
  const add = useStore((s) => s.addChromosomeClassDef);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ChromosomeClassType | "all">("all");
  const [activeId, setActiveId] = useState<string | undefined>(classes[0]?.id);

  const filtered = useMemo(() => {
    return classes
      .filter((c) => (type === "all" ? true : c.type === type))
      .filter((c) =>
        search
          ? c.label.toLowerCase().includes(search.toLowerCase())
          : true
      )
      .sort((a, b) => {
        const subA = subgenomes.find((s) => s.id === a.subgenomeId)?.letter ?? a.subgenomeId;
        const subB = subgenomes.find((s) => s.id === b.subgenomeId)?.letter ?? b.subgenomeId;
        if (subA !== subB) return subA.localeCompare(subB);
        if (a.classNumber !== b.classNumber) return a.classNumber - b.classNumber;
        return a.label.localeCompare(b.label);
      });
  }, [classes, search, type, subgenomes]);
  const cls = useMemo(
    () => classes.find((c) => c.id === activeId) ?? classes[0],
    [classes, activeId]
  );

  const list = (
    <Card pad={false}>
      <div className="space-y-2 border-b border-brand-line p-3">
        <div className="flex items-center gap-2">
          <Input
            leading={<Search size={14} />}
            placeholder="Поиск по метке…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() => {
              const id = add({
                label: "новый",
                subgenomeId: subgenomes[0]?.id ?? "SG-A",
                classNumber: 1,
                type: "standard",
              });
              setActiveId(id);
              toast.success("Добавлен");
            }}
          >
            <Plus size={13} /> Добавить
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = type === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setType(f.id)}
                className={classNames(
                  "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition",
                  active
                    ? "border-brand-deep bg-brand-deep text-brand-cream"
                    : "border-brand-line bg-white text-brand-deep hover:bg-brand-mint/40"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Нет классов" />
      ) : (
        <ul className="max-h-[60vh] overflow-y-auto">
          {filtered.map((c) => {
            const isActive = activeId === c.id;
            const sub = subgenomes.find((s) => s.id === c.subgenomeId);
            return (
              <li
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={classNames(
                  "flex cursor-pointer items-center gap-3 border-t border-brand-line/60 px-3 py-2 text-[12.5px] transition",
                  isActive ? "bg-brand-cream" : "hover:bg-brand-mint/40"
                )}
              >
                <span className="font-mono font-bold text-brand-deep w-16">{c.label}</span>
                <span className="flex-1 text-brand-muted">{sub?.name ?? c.subgenomeId}</span>
                <span className="rounded bg-brand-mint px-1.5 py-0.5 text-[10px] font-bold text-brand-dark uppercase">
                  {c.type}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  return <DictionaryShell list={list} detail={cls ? <ChromosomeClassCard cls={cls} /> : null} />;
}

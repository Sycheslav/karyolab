import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";
import DictionaryShell from "./DictionaryShell";
import SpeciesCard from "./SpeciesCard";

export default function SpeciesDictionary() {
  const species = useStore((s) => s.species);
  const samples = useStore((s) => s.samples);
  const add = useStore((s) => s.addSpecies);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | undefined>(species[0]?.id);

  const filtered = species.filter((sp) =>
    search ? sp.name.toLowerCase().includes(search.toLowerCase()) : true
  );
  const sp = useMemo(
    () => species.find((s) => s.id === activeId) ?? species[0],
    [species, activeId]
  );

  const list = (
    <Card pad={false}>
      <div className="flex items-center gap-2 border-b border-brand-line p-3">
        <Input
          leading={<Search size={14} />}
          placeholder="Поиск…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          size="sm"
          onClick={() => {
            const id = add({ name: "Новый вид", templates: [] });
            setActiveId(id);
            toast.success("Вид добавлен");
          }}
        >
          <Plus size={13} /> Добавить
        </Button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Нет видов" />
      ) : (
        <ul>
          {filtered.map((s) => {
            const isActive = activeId === s.id;
            const list = samples.filter(
              (x) => x.species === s.latinName || x.species === s.name
            );
            return (
              <li
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={classNames(
                  "flex cursor-pointer items-center gap-3 border-t border-brand-line/60 px-3 py-2.5 text-[12.5px] transition",
                  isActive ? "bg-brand-cream" : "hover:bg-brand-mint/40"
                )}
              >
                <div className="flex-1">
                  <div className="font-bold text-brand-deep">{s.name}</div>
                  <div className="text-[11px] italic text-brand-muted">
                    {s.latinName}
                  </div>
                </div>
                <span className="rounded-full bg-brand-mint px-2 py-0.5 text-[10.5px] font-bold text-brand-dark">
                  {list.length} образцов
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  return <DictionaryShell list={list} detail={sp ? <SpeciesCard sp={sp} /> : null} />;
}

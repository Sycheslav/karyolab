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
import SubgenomeCard from "./SubgenomeCard";

export default function SubgenomesDictionary() {
  const subgenomes = useStore((s) => s.subgenomes);
  const add = useStore((s) => s.addSubgenome);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | undefined>(subgenomes[0]?.id);

  const filtered = subgenomes.filter((s) =>
    search ? `${s.letter} ${s.name}`.toLowerCase().includes(search.toLowerCase()) : true
  );
  const sg = useMemo(
    () => subgenomes.find((s) => s.id === activeId) ?? subgenomes[0],
    [subgenomes, activeId]
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
            const id = add({ letter: "X", name: "Новый субгеном" });
            setActiveId(id);
            toast.success("Добавлен");
          }}
        >
          <Plus size={13} /> Добавить
        </Button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Нет субгеномов" />
      ) : (
        <ul>
          {filtered.map((s) => {
            const isActive = activeId === s.id;
            return (
              <li
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={classNames(
                  "flex cursor-pointer items-center gap-3 border-t border-brand-line/60 px-3 py-2.5 text-[12.5px] transition",
                  isActive ? "bg-brand-cream" : "hover:bg-brand-mint/40"
                )}
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-deep text-[14px] font-extrabold text-brand-cream">
                  {s.letter}
                </span>
                <div className="flex-1">
                  <div className="font-bold text-brand-deep">{s.name}</div>
                  <div className="text-[11px] text-brand-muted truncate">
                    {s.description}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  return <DictionaryShell list={list} detail={sg ? <SubgenomeCard sg={sg} /> : null} />;
}

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
import FluorochromeCard from "./FluorochromeCard";

const DOT: Record<string, string> = {
  red: "bg-red-500",
  green: "bg-emerald-500",
  blue: "bg-blue-500",
};

export default function FluorochromesDictionary() {
  const fluorochromes = useStore((s) => s.fluorochromes);
  const add = useStore((s) => s.addFluorochrome);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | undefined>(
    fluorochromes[0]?.id
  );

  const filtered = fluorochromes.filter((f) =>
    search ? f.name.toLowerCase().includes(search.toLowerCase()) : true
  );
  const flu = useMemo(
    () => fluorochromes.find((f) => f.id === activeId) ?? fluorochromes[0],
    [fluorochromes, activeId]
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
            const id = add({ name: "Новый", channel: "green" });
            setActiveId(id);
            toast.success("Добавлен");
          }}
        >
          <Plus size={13} /> Добавить
        </Button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Нет флюорохромов" />
      ) : (
        <ul>
          {filtered.map((f) => {
            const isActive = activeId === f.id;
            return (
              <li
                key={f.id}
                onClick={() => setActiveId(f.id)}
                className={classNames(
                  "flex cursor-pointer items-center gap-3 border-t border-brand-line/60 px-3 py-2.5 text-[12.5px] transition",
                  isActive ? "bg-brand-cream" : "hover:bg-brand-mint/40"
                )}
              >
                <span
                  className={classNames(
                    "h-3 w-3 rounded-full",
                    DOT[f.channel] ?? "bg-slate-400"
                  )}
                />
                <div className="flex-1">
                  <div className="font-bold text-brand-deep">{f.name}</div>
                  <div className="text-[11px] text-brand-muted">
                    {f.channel}
                    {f.isCounterstain && " · контрокраска"}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  return <DictionaryShell list={list} detail={flu ? <FluorochromeCard flu={flu} /> : null} />;
}

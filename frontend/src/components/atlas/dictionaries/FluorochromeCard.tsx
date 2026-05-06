import { useEffect, useState } from "react";
import { Pencil, Save, Trash2, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import SectionTitle from "@/components/ui/SectionTitle";
import { useStore } from "@/lib/store";
import type { Fluorochrome } from "@/lib/types";

export default function FluorochromeCard({ flu }: { flu: Fluorochrome }) {
  const probes = useStore((s) => s.atlasProbes);
  const update = useStore((s) => s.updateFluorochrome);
  const remove = useStore((s) => s.deleteFluorochrome);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Fluorochrome>(flu);
  useEffect(() => {
    setDraft(flu);
    setEditing(false);
  }, [flu]);

  const usedBy = probes.filter((p) => p.fluorochromeId === flu.id);

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="label-cap">Флюорохром</div>
          <h2 className="text-[20px] font-extrabold text-brand-deep">{draft.name}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={() => {
                  update(flu.id, draft);
                  setEditing(false);
                  toast.success("Флюорохром обновлён");
                }}
              >
                <Save size={13} /> Сохранить
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDraft(flu);
                  setEditing(false);
                }}
              >
                <Undo2 size={13} /> Отмена
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil size={13} /> Изменить
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={usedBy.length > 0}
                title={
                  usedBy.length > 0
                    ? `Используется в ${usedBy.length} зондах`
                    : undefined
                }
                onClick={() => {
                  remove(flu.id);
                  toast("Удалён");
                }}
              >
                <Trash2 size={13} /> Удалить
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          label="Название"
          value={draft.name}
          disabled={!editing}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <Select
          label="Канал"
          value={draft.channel}
          disabled={!editing}
          onChange={(e) =>
            setDraft({ ...draft, channel: e.target.value as Fluorochrome["channel"] })
          }
        >
          <option value="red">red</option>
          <option value="green">green</option>
          <option value="blue">blue</option>
        </Select>
      </div>
      <Textarea
        label="Описание"
        value={draft.description ?? ""}
        disabled={!editing}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        rows={2}
      />
      <label className="flex items-center gap-2 text-[12.5px] text-brand-deep">
        <input
          type="checkbox"
          disabled={!editing}
          checked={!!draft.isCounterstain}
          onChange={(e) =>
            setDraft({ ...draft, isCounterstain: e.target.checked })
          }
          className="h-4 w-4 accent-brand"
        />
        Контрокраска
      </label>

      {usedBy.length > 0 && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          Этот флюорохром используется в {usedBy.length} зондах. Сначала перенесите их.
        </div>
      )}

      <div>
        <SectionTitle title="Зонды на этом флюорохроме" />
        {usedBy.length === 0 ? (
          <div className="mt-2 text-[12px] text-brand-muted">Зондов нет.</div>
        ) : (
          <ul className="mt-2 space-y-1 text-[12.5px]">
            {usedBy.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-brand-line bg-white px-2 py-1.5"
              >
                <span className="font-bold text-brand-deep">{p.name}</span>
                {p.target && <span className="text-brand-muted"> · {p.target}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

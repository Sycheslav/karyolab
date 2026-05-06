import { useEffect, useState } from "react";
import { AlertTriangle, Pencil, Save, Trash2, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import SectionTitle from "@/components/ui/SectionTitle";
import { useStore } from "@/lib/store";
import type { SubgenomeDef } from "@/lib/types";

export default function SubgenomeCard({ sg }: { sg: SubgenomeDef }) {
  const update = useStore((s) => s.updateSubgenome);
  const remove = useStore((s) => s.deleteSubgenome);
  const species = useStore((s) => s.species);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SubgenomeDef>(sg);
  useEffect(() => {
    setDraft(sg);
    setEditing(false);
  }, [sg]);

  const usedBy = species.filter((s) =>
    s.templates.some((t) => t.subgenomes.includes(sg.letter))
  );

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="label-cap">Субгеном</div>
          <h2 className="text-[24px] font-extrabold text-brand-deep">
            {draft.letter}
          </h2>
          <div className="text-[12.5px] text-brand-muted">{draft.name}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={() => {
                  update(sg.id, draft);
                  setEditing(false);
                  toast.success("Сохранено");
                }}
              >
                <Save size={13} /> Сохранить
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDraft(sg);
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
                onClick={() => {
                  remove(sg.id);
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
          label="Буква"
          maxLength={3}
          value={draft.letter}
          disabled={!editing}
          onChange={(e) => setDraft({ ...draft, letter: e.target.value.toUpperCase() })}
        />
        <Input
          label="Название"
          value={draft.name}
          disabled={!editing}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      </div>

      {editing && draft.letter !== sg.letter && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          <AlertTriangle size={14} />
          Изменение буквы ломает разметки в кариотипах.
        </div>
      )}

      <Textarea
        label="Описание"
        value={draft.description ?? ""}
        disabled={!editing}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        rows={2}
      />

      <div>
        <SectionTitle title="Используется в видах" />
        {usedBy.length === 0 ? (
          <div className="mt-2 text-[12px] text-brand-muted">Не используется.</div>
        ) : (
          <ul className="mt-2 space-y-1 text-[12.5px]">
            {usedBy.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-brand-line bg-white px-2 py-1.5"
              >
                <span className="font-bold text-brand-deep">{s.name}</span>
                {s.latinName && <span className="text-brand-muted"> · {s.latinName}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

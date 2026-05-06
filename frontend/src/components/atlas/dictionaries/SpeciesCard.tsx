import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Pencil, Plus, Save, Trash2, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import SectionTitle from "@/components/ui/SectionTitle";
import { selectSpeciesSamples, useStore } from "@/lib/store";
import type { SpeciesDef, SpeciesTemplate } from "@/lib/types";

export default function SpeciesCard({ sp }: { sp: SpeciesDef }) {
  const nav = useNavigate();
  const update = useStore((s) => s.updateSpecies);
  const remove = useStore((s) => s.deleteSpecies);
  const samples = useStore((s) => selectSpeciesSamples(s, sp.id));

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SpeciesDef>(sp);
  useEffect(() => {
    setDraft(sp);
    setEditing(false);
  }, [sp]);

  const updateTemplate = (idx: number, patch: Partial<SpeciesTemplate>) => {
    setDraft({
      ...draft,
      templates: draft.templates.map((t, i) =>
        i === idx ? { ...t, ...patch } : t
      ),
    });
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="label-cap">Вид</div>
          <h2 className="text-[20px] font-extrabold text-brand-deep">{draft.name}</h2>
          {draft.latinName && (
            <div className="text-[12.5px] italic text-brand-muted">
              {draft.latinName}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={() => {
                  update(sp.id, draft);
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
                  setDraft(sp);
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
                  remove(sp.id);
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
        <Input
          label="Латинское название"
          value={draft.latinName ?? ""}
          disabled={!editing}
          onChange={(e) => setDraft({ ...draft, latinName: e.target.value })}
        />
        <Input
          label="Плоидность"
          type="number"
          value={draft.ploidy ?? ""}
          disabled={!editing}
          onChange={(e) =>
            setDraft({
              ...draft,
              ploidy: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
        />
        <Input
          label="Ожидаемое число хромосом (2n)"
          type="number"
          value={draft.expectedChromosomeCount ?? ""}
          disabled={!editing}
          onChange={(e) =>
            setDraft({
              ...draft,
              expectedChromosomeCount: e.target.value
                ? parseInt(e.target.value)
                : undefined,
            })
          }
        />
      </div>
      <Textarea
        label="Комментарий"
        value={draft.comment ?? ""}
        disabled={!editing}
        onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
        rows={2}
      />

      <div>
        <SectionTitle
          title="Типовые наборы субгеномов"
          right={
            editing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setDraft({
                    ...draft,
                    templates: [
                      ...draft.templates,
                      {
                        id: `ST-${Date.now().toString(36)}`,
                        name: "Новый",
                        subgenomes: ["A"],
                        classCount: 7,
                      },
                    ],
                  })
                }
              >
                <Plus size={13} /> Добавить
              </Button>
            ) : null
          }
        />
        <div className="mt-2 space-y-1.5">
          {draft.templates.map((t, idx) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-lg border border-brand-line bg-white p-2"
            >
              <Input
                placeholder="ABD"
                value={t.subgenomes.join("")}
                disabled={!editing}
                onChange={(e) =>
                  updateTemplate(idx, {
                    subgenomes: e.target.value
                      .toUpperCase()
                      .split("")
                      .filter((c) => /[A-Z]/.test(c)),
                  })
                }
              />
              <Input
                type="number"
                value={t.classCount}
                disabled={!editing}
                onChange={(e) =>
                  updateTemplate(idx, { classCount: parseInt(e.target.value || "7") })
                }
              />
              {editing && (
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      templates: draft.templates.filter((_, i) => i !== idx),
                    })
                  }
                  className="grid h-8 w-8 place-items-center rounded text-brand-muted hover:bg-brand-cream hover:text-brand-danger"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Образцы вида" />
        {samples.length === 0 ? (
          <div className="mt-2 text-[12px] text-brand-muted">Нет образцов.</div>
        ) : (
          <ul className="mt-2 space-y-1 text-[12.5px]">
            {samples.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => nav(`/журнал/образец/${s.id}`)}
                  className="text-brand-dark hover:underline"
                >
                  S-{s.id}
                </button>
                <span className="ml-2 text-brand-muted">{s.species}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        variant="outline"
        onClick={() => nav(`/атлас/матрица?speciesId=${sp.id}`)}
      >
        <LayoutGrid size={14} /> Показать кариотипы вида
      </Button>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Pencil, Plus, Save, Trash2, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Tabs from "@/components/ui/Tabs";
import Tag from "@/components/ui/Tag";
import Textarea from "@/components/ui/Textarea";
import SectionTitle from "@/components/ui/SectionTitle";
import ChromosomeGlyph from "@/components/karyotype/ChromosomeGlyph";
import { useStore } from "@/lib/store";
import type { ChromosomeClassDef } from "@/lib/types";

const TYPE_OPTIONS = [
  { id: "standard", label: "стандарт" },
  { id: "translocation", label: "транслокация" },
  { id: "substitution", label: "замещение" },
  { id: "foreign", label: "чужеродный" },
  { id: "derivative", label: "деривативный" },
];

export default function ChromosomeClassCard({ cls }: { cls: ChromosomeClassDef }) {
  const nav = useNavigate();
  const subgenomes = useStore((s) => s.subgenomes);
  const chromosomes = useStore((s) => s.chromosomes);
  const update = useStore((s) => s.updateChromosomeClassDef);
  const remove = useStore((s) => s.deleteChromosomeClassDef);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ChromosomeClassDef>(cls);
  const [synonymInput, setSynonymInput] = useState("");
  useEffect(() => {
    setDraft(cls);
    setEditing(false);
    setSynonymInput("");
  }, [cls]);

  const matchedChromosomes = chromosomes.filter((c) => c.displayName === cls.label);

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="label-cap">Класс хромосом</div>
          <h2 className="text-[20px] font-extrabold text-brand-deep">
            {draft.label}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={() => {
                  update(cls.id, draft);
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
                  setDraft(cls);
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
                  remove(cls.id);
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
          label="Метка"
          value={draft.label}
          disabled={!editing}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
        />
        <Select
          label="Субгеном"
          value={draft.subgenomeId}
          disabled={!editing}
          onChange={(e) => setDraft({ ...draft, subgenomeId: e.target.value })}
        >
          {subgenomes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.letter} · {s.name}
            </option>
          ))}
        </Select>
        <Input
          label="Номер класса"
          type="number"
          value={draft.classNumber}
          disabled={!editing}
          onChange={(e) =>
            setDraft({ ...draft, classNumber: parseInt(e.target.value || "0") })
          }
        />
      </div>

      <div>
        <div className="label-cap mb-1.5">Тип</div>
        <Tabs
          value={draft.type}
          onChange={(id) =>
            editing && setDraft({ ...draft, type: id as ChromosomeClassDef["type"] })
          }
          options={TYPE_OPTIONS}
        />
      </div>

      <div>
        <div className="label-cap mb-1.5">Синонимы</div>
        <div className="flex flex-wrap gap-1.5">
          {(draft.synonyms ?? []).map((s) => (
            <Tag
              key={s}
              onRemove={
                editing
                  ? () =>
                      setDraft({
                        ...draft,
                        synonyms: draft.synonyms?.filter((x) => x !== s),
                      })
                  : undefined
              }
            >
              {s}
            </Tag>
          ))}
          {editing && (
            <div className="flex gap-2">
              <Input
                placeholder="новый синоним"
                value={synonymInput}
                onChange={(e) => setSynonymInput(e.target.value)}
                className="!h-8 !py-0.5"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!synonymInput.trim()) return;
                  setDraft({
                    ...draft,
                    synonyms: [...(draft.synonyms ?? []), synonymInput.trim()],
                  });
                  setSynonymInput("");
                }}
              >
                <Plus size={12} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Textarea
        label="Описание"
        value={draft.description ?? ""}
        disabled={!editing}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        rows={2}
      />

      {matchedChromosomes.length > 0 && (
        <div>
          <SectionTitle title={`Хромосомы класса · ${matchedChromosomes.length}`} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {matchedChromosomes.slice(0, 12).map((c) => (
              <ChromosomeGlyph key={c.id} chromosome={c} height={32} />
            ))}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => nav(`/атлас/матрица?classId=${cls.id}`)}
      >
        <LayoutGrid size={14} /> Показать в матрице
      </Button>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { Pencil, Save, Trash2, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Tabs from "@/components/ui/Tabs";
import Tag from "@/components/ui/Tag";
import Textarea from "@/components/ui/Textarea";
import { useStore } from "@/lib/store";
import type { TheoreticalRecord, TheoreticalSourceType } from "@/lib/types";
import TheoreticalBadge from "../shared/TheoreticalBadge";

const SOURCE_OPTIONS: { id: TheoreticalSourceType; label: string }[] = [
  { id: "literature", label: "Литература" },
  { id: "hypothesis", label: "Гипотеза" },
  { id: "note", label: "Заметка" },
  { id: "protocol", label: "Протокол" },
];

export default function TheoreticalRecordCard({ rec }: { rec: TheoreticalRecord }) {
  const update = useStore((s) => s.updateTheoreticalRecord);
  const remove = useStore((s) => s.deleteTheoreticalRecord);
  const species = useStore((s) => s.species);
  const samples = useStore((s) => s.samples);
  const classes = useStore((s) => s.chromosomeClasses);
  const probes = useStore((s) => s.atlasProbes);
  const anomalies = useStore((s) => s.anomalyTypes);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TheoreticalRecord>(rec);
  useEffect(() => {
    setDraft(rec);
    setEditing(false);
  }, [rec]);

  const refOptions =
    draft.scope.kind === "taxon"
      ? species.map((s) => ({ id: s.id, label: `${s.name} (${s.latinName ?? ""})` }))
      : samples.map((s) => ({ id: s.id, label: `S-${s.id}` }));

  return (
    <Card className="space-y-3 bg-brand-mint/30">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <TheoreticalBadge />
          <h2 className="text-[18px] font-extrabold text-brand-deep">
            {draft.title}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={() => {
                  update(rec.id, draft);
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
                  setDraft(rec);
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
                  remove(rec.id);
                  toast("Удалено");
                }}
              >
                <Trash2 size={13} /> Удалить
              </Button>
            </>
          )}
        </div>
      </div>

      <Input
        label="Заголовок"
        value={draft.title}
        disabled={!editing}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="label-cap mb-1.5">Область</div>
          <Tabs
            value={draft.scope.kind}
            onChange={(id) =>
              editing &&
              setDraft({
                ...draft,
                scope: { kind: id as "taxon" | "sample", ref: refOptions[0]?.id ?? "" },
              })
            }
            options={[
              { id: "taxon", label: "Таксон" },
              { id: "sample", label: "Образец" },
            ]}
          />
        </div>
        <Select
          label={draft.scope.kind === "taxon" ? "Вид" : "Образец"}
          value={draft.scope.ref}
          disabled={!editing}
          onChange={(e) =>
            setDraft({ ...draft, scope: { ...draft.scope, ref: e.target.value } })
          }
        >
          {refOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <div className="label-cap mb-1.5">Тип источника</div>
        <Tabs
          value={draft.sourceType}
          onChange={(id) =>
            editing && setDraft({ ...draft, sourceType: id as TheoreticalSourceType })
          }
          options={SOURCE_OPTIONS}
        />
      </div>

      <Input
        label="Источник"
        value={draft.source ?? ""}
        disabled={!editing}
        onChange={(e) => setDraft({ ...draft, source: e.target.value })}
      />
      <Textarea
        label="Описание"
        value={draft.description ?? ""}
        disabled={!editing}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        rows={3}
      />

      <RelatedChips
        label="Связанные классы"
        ids={draft.relatedClassIds ?? []}
        options={classes.map((c) => ({ id: c.id, label: c.label }))}
        editing={editing}
        onChange={(ids) => setDraft({ ...draft, relatedClassIds: ids })}
      />
      <RelatedChips
        label="Связанные зонды"
        ids={draft.relatedProbeIds ?? []}
        options={probes.map((p) => ({ id: p.id, label: p.name }))}
        editing={editing}
        onChange={(ids) => setDraft({ ...draft, relatedProbeIds: ids })}
      />
      <RelatedChips
        label="Связанные аномалии"
        ids={(draft.relatedAnomalyCodes ?? []) as string[]}
        options={anomalies.map((a) => ({ id: a.code, label: a.label }))}
        editing={editing}
        onChange={(ids) =>
          setDraft({
            ...draft,
            relatedAnomalyCodes: ids as TheoreticalRecord["relatedAnomalyCodes"],
          })
        }
      />

      <label className="flex items-center gap-2 text-[12.5px] text-brand-deep">
        <input
          type="checkbox"
          disabled={!editing}
          checked={!!draft.isReference}
          onChange={(e) => setDraft({ ...draft, isReference: e.target.checked })}
          className="h-4 w-4 accent-brand"
        />
        Теоретический эталон
      </label>
    </Card>
  );
}

function RelatedChips({
  label,
  ids,
  options,
  editing,
  onChange,
}: {
  label: string;
  ids: string[];
  options: { id: string; label: string }[];
  editing: boolean;
  onChange: (ids: string[]) => void;
}) {
  const [select, setSelect] = useState("");
  const remaining = options.filter((o) => !ids.includes(o.id));
  return (
    <div>
      <div className="label-cap mb-1.5">{label}</div>
      <div className="flex flex-wrap items-center gap-1.5">
        {ids.map((id) => {
          const opt = options.find((o) => o.id === id);
          return (
            <Tag
              key={id}
              onRemove={editing ? () => onChange(ids.filter((x) => x !== id)) : undefined}
            >
              {opt?.label ?? id}
            </Tag>
          );
        })}
        {editing && remaining.length > 0 && (
          <select
            className="field !h-8 !py-0.5 text-[12px]"
            value={select}
            onChange={(e) => {
              if (e.target.value) {
                onChange([...ids, e.target.value]);
                setSelect("");
              }
            }}
          >
            <option value="">+ добавить…</option>
            {remaining.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

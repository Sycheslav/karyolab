import { useEffect, useState } from "react";
import { Pencil, Save, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Tabs from "@/components/ui/Tabs";
import Textarea from "@/components/ui/Textarea";
import { useStore } from "@/lib/store";
import type {
  AnomalyLevel,
  AnomalyMarkerShape,
  AnomalyTypeMeta,
} from "@/lib/types";
import { classNames } from "@/lib/utils";

const LEVEL_OPTIONS: { id: AnomalyLevel; label: string }[] = [
  { id: "chromosome", label: "хромосома" },
  { id: "metaphase", label: "метафаза" },
  { id: "hybridization", label: "гибридизация" },
  { id: "sample", label: "образец" },
];

const SHAPE_OPTIONS: { id: AnomalyMarkerShape; label: string }[] = [
  { id: "tri", label: "Треугольник" },
  { id: "circle", label: "Круг" },
  { id: "square", label: "Квадрат" },
];

const COLORS = ["amber", "red", "blue", "emerald", "violet", "slate"];

const COLOR_BG: Record<string, string> = {
  amber: "bg-amber-400",
  red: "bg-red-500",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  slate: "bg-slate-400",
};

function MarkerPreview({ color, shape }: { color: string; shape: AnomalyMarkerShape }) {
  const cls = COLOR_BG[color] ?? "bg-slate-400";
  if (shape === "circle") {
    return <span className={classNames("h-6 w-6 rounded-full", cls)} />;
  }
  if (shape === "square") {
    return <span className={classNames("h-6 w-6 rounded-sm", cls)} />;
  }
  return (
    <span
      className={classNames(cls)}
      style={{
        clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
        width: 24,
        height: 22,
        display: "inline-block",
      }}
    />
  );
}

export default function AnomalyTypeCard({ ano }: { ano: AnomalyTypeMeta }) {
  const update = useStore((s) => s.updateAnomalyType);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AnomalyTypeMeta>(ano);
  useEffect(() => {
    setDraft(ano);
    setEditing(false);
  }, [ano]);

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="label-cap">Аномалия</div>
          <h2 className="text-[20px] font-extrabold text-brand-deep">
            {draft.label}
          </h2>
          <div className="font-mono text-[11px] text-brand-muted">{draft.code}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={() => {
                  update(ano.code, draft);
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
                  setDraft(ano);
                  setEditing(false);
                }}
              >
                <Undo2 size={13} /> Отмена
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil size={13} /> Изменить
            </Button>
          )}
        </div>
      </div>

      <Input
        label="Название"
        value={draft.label}
        disabled={!editing}
        onChange={(e) => setDraft({ ...draft, label: e.target.value })}
      />
      <Textarea
        label="Описание"
        value={draft.description}
        disabled={!editing}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        rows={2}
      />

      <div>
        <div className="label-cap mb-1.5">Уровень по умолчанию</div>
        <Tabs
          value={draft.defaultLevel}
          onChange={(id) =>
            editing && setDraft({ ...draft, defaultLevel: id as AnomalyLevel })
          }
          options={LEVEL_OPTIONS}
        />
      </div>

      <div>
        <div className="label-cap mb-1.5">Цвет маркера</div>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => {
            const active = draft.markerColor === c;
            return (
              <button
                key={c}
                type="button"
                disabled={!editing}
                onClick={() => setDraft({ ...draft, markerColor: c })}
                className={classNames(
                  "h-8 w-8 rounded-lg border transition",
                  COLOR_BG[c],
                  active ? "ring-2 ring-brand-deep" : "border-brand-line"
                )}
                title={c}
                aria-label={c}
              />
            );
          })}
        </div>
      </div>

      <div>
        <div className="label-cap mb-1.5">Форма маркера</div>
        <Tabs
          value={draft.markerShape}
          onChange={(id) =>
            editing && setDraft({ ...draft, markerShape: id as AnomalyMarkerShape })
          }
          options={SHAPE_OPTIONS}
        />
      </div>

      <div>
        <div className="label-cap mb-1.5">Превью</div>
        <div className="grid h-16 place-items-center rounded-xl bg-slate-950">
          <MarkerPreview color={draft.markerColor} shape={draft.markerShape} />
        </div>
      </div>
    </Card>
  );
}

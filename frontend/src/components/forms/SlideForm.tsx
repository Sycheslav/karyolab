import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import StorageFields from "./StorageFields";
import { FlaskConical, Info, Plus } from "lucide-react";
import { classNames } from "@/lib/utils";
import type { PreparationSource, Quality } from "@/lib/types";

interface Props {
  defaultDate?: string;
}

export default function SlideForm({ defaultDate }: Props) {
  const nav = useNavigate();
  const createSlideEvent = useStore((s) => s.createSlideEvent);
  const samples = useStore((s) => s.samples);
  const plants = useStore((s) => s.plants);

  const [sampleId, setSampleId] = useState(samples[0]?.id ?? "");
  const sPlants = useMemo(
    () => plants.filter((p) => p.sampleId === sampleId),
    [plants, sampleId]
  );

  // Источник: растение или смесь растений.
  // По умолчанию — конкретное растение, если оно есть; иначе — режим выбора.
  const [sourceKind, setSourceKind] = useState<"plant" | "mix">(
    sPlants.length > 0 ? "plant" : "mix"
  );
  const [plantId, setPlantId] = useState(sPlants[0]?.id ?? "");

  const [quality, setQuality] = useState<Quality>("high");
  const [jar, setJar] = useState("");
  const [fridge, setFridge] = useState("");
  const [comment, setComment] = useState("");
  const todayIso = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(defaultDate ?? todayIso);
  const [time, setTime] = useState("13:00");

  // Если у образца нет растений и пользователь выбрал «растение», подсказка.
  const noPlantsAvailable = sourceKind === "plant" && sPlants.length === 0;

  function buildSource(): PreparationSource {
    if (sourceKind === "mix") return { kind: "mix" };
    return { kind: "plant", plantId };
  }

  function save(createAnother = false) {
    if (!sampleId) {
      toast.error("Выберите образец");
      return;
    }
    if (sourceKind === "plant" && !plantId) {
      toast.error("Выберите конкретное растение или режим «смесь растений»");
      return;
    }
    const source = buildSource();
    const { eventId, preparationIds } = createSlideEvent({
      sampleId,
      source,
      quality,
      storageJar: jar,
      storageFridge: fridge,
      count: 1,
      operator: "Лаборант",
      comment,
      startDate: `${date}T${time}:00`,
    });
    void preparationIds;
    toast.success("Препарат создан");
    if (createAnother) {
      setComment("");
      return;
    }
    nav(`/журнал/ивент/${eventId}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card>
        <SectionTitle
          icon={<FlaskConical size={16} />}
          title="Создание препарата"
          hint="Один препарат — одно сохранение. Каждый получает собственный ID, качество и место хранения."
        />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Образец"
            value={sampleId}
            onChange={(e) => {
              setSampleId(e.target.value);
              const next = plants.filter((p) => p.sampleId === e.target.value);
              setPlantId(next[0]?.id ?? "");
              setSourceKind(next.length > 0 ? "plant" : "mix");
            }}
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                S-{s.id} · {s.species}
              </option>
            ))}
          </Select>

          <div>
            <span className="label-cap mb-1.5 block">Источник материала</span>
            <div className="inline-flex w-full rounded-xl border border-brand-line bg-white p-1">
              <button
                type="button"
                onClick={() => setSourceKind("plant")}
                className={classNames(
                  "flex-1 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition",
                  sourceKind === "plant"
                    ? "bg-brand-cream text-brand-deep"
                    : "text-brand-muted hover:text-brand-deep"
                )}
              >
                Конкретное растение
              </button>
              <button
                type="button"
                onClick={() => setSourceKind("mix")}
                className={classNames(
                  "flex-1 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition",
                  sourceKind === "mix"
                    ? "bg-brand-cream text-brand-deep"
                    : "text-brand-muted hover:text-brand-deep"
                )}
              >
                Смесь растений
              </button>
            </div>
          </div>
        </div>

        {sourceKind === "plant" && (
          <div className="mt-4">
            {sPlants.length > 0 ? (
              <Select
                label="Растение"
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
              >
                {sPlants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.location ? ` · ${p.location}` : ""}
                  </option>
                ))}
              </Select>
            ) : (
              <div className="rounded-xl border border-brand-warn/40 bg-amber-50 p-3 text-[12.5px] text-amber-900">
                У этого образца пока нет растений. Создайте растение в карточке
                образца или выберите режим «смесь растений», если препарат
                сделан из смешанного материала.
              </div>
            )}
          </div>
        )}

        {sourceKind === "mix" && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-line bg-brand-mint/40 p-3 text-[12.5px] text-brand-deep">
            <Info size={14} className="mt-0.5 text-brand-dark" />
            <span>
              Препарат не привязывается к конкретному растению, но остаётся
              отдельным физическим стеклом со своим ID, качеством и хранением.
            </span>
          </div>
        )}

        <div className="mt-4">
          <span className="label-cap mb-1.5 block">Качество препарата</span>
          <div className="inline-flex rounded-xl border border-brand-line bg-white p-1">
            {(["high", "medium", "low"] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={classNames(
                  "rounded-lg px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-wider transition",
                  q === quality
                    ? q === "high"
                      ? "bg-brand-accent/30 text-brand-dark"
                      : q === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-brand-danger/15 text-brand-danger"
                    : "text-brand-muted hover:text-brand-deep"
                )}
              >
                {qualityLabel(q)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Дата создания препарата" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Дата"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Время"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </Card>

      <Card accent>
        <SectionTitle title="Место хранения" />
        <div className="mt-4">
          <StorageFields
            fridge={fridge}
            box={jar}
            onFridge={setFridge}
            onBox={setJar}
            fridgeLabel="Холодильник / шкаф"
            boxLabel="Банка / коробка"
          />
        </div>
      </Card>

      <Card>
        <Textarea
          label="Комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Дополнительные детали препарата…"
        />
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" onClick={() => history.back()}>
          Отмена
        </Button>
        <Button
          variant="secondary"
          onClick={() => save(true)}
          title="Сохранить и создать ещё один препарат от того же образца"
          disabled={noPlantsAvailable}
        >
          <Plus size={13} />
          Создать ещё от этого образца
        </Button>
        <Button onClick={() => save(false)} disabled={noPlantsAvailable}>
          Сохранить препарат
        </Button>
      </div>
    </div>
  );
}

function qualityLabel(q: Quality) {
  return q === "high" ? "Высокое" : q === "medium" ? "Среднее" : "Низкое";
}

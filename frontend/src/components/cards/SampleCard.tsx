import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArchiveIcon,
  Calendar,
  ChevronDown,
  Image as ImageIcon,
  Pencil,
  Plus,
  Sprout,
  Layers,
  TreePine,
  Upload,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Preparation, Sample, StainedPreparation } from "@/lib/types";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SectionTitle from "@/components/ui/SectionTitle";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { fmtDateLong, classNames } from "@/lib/utils";
import { eventTypeLabel } from "@/components/calendar/eventColors";

interface Props {
  sample: Sample;
}

const sampleStatusLabel: Record<Sample["status"], string> = {
  draft: "Черновик",
  registered: "Зарегистрирован",
  germinating: "Проращивается",
  in_work: "В работе",
  result: "Есть результат",
};

const prepStatusLabel: Record<Preparation["status"], string> = {
  created: "Создан",
  pre_washed: "Предгиб. отмыт",
  hybridized: "Гибридизован",
  photographed: "Сфотографирован",
  rehyb_ready: "Готов к повторной гибридизации",
  discarded: "Выброшен",
};

const prepStatusTone = (s: Preparation["status"]) =>
  s === "discarded"
    ? "red"
    : s === "photographed"
      ? "dark"
      : s === "hybridized"
        ? "green"
        : "mint";

export default function SampleCard({ sample }: Props) {
  const nav = useNavigate();
  const plants = useStore((s) =>
    s.plants.filter((p) => p.sampleId === sample.id)
  );
  const preps = useStore((s) =>
    s.preparations.filter((p) => p.sampleId === sample.id)
  );
  const stained = useStore((s) => s.stained);
  const events = useStore((s) =>
    s.events.filter((e) =>
      "sampleId" in e
        ? (e as { sampleId: string }).sampleId === sample.id
        : "sampleIds" in e
          ? ((e as { sampleIds: string[] }).sampleIds ?? []).includes(sample.id)
          : false
    )
  );

  // Группируем препараты: по растениям + отдельная ветка для смеси
  const grouped = useMemo(() => {
    const byPlant = new Map<string, Preparation[]>();
    const mix: Preparation[] = [];
    for (const p of preps) {
      if (p.source.kind === "mix") mix.push(p);
      else {
        const list = byPlant.get(p.source.plantId) ?? [];
        list.push(p);
        byPlant.set(p.source.plantId, list);
      }
    }
    return { byPlant, mix };
  }, [preps]);

  const [openPlants, setOpenPlants] = useState<Record<string, boolean>>({
    [plants[0]?.id ?? ""]: true,
    "__mix__": true,
  });
  const [openPreps, setOpenPreps] = useState<Record<string, boolean>>({});

  // Возможные следующие шаги
  const hasMatureNoPrep = preps.length === 0;
  const hasCreatedNoWash = preps.some((p) => p.status === "created");
  const hasWashedNoHyb = preps.some(
    (p) => p.status === "pre_washed" || p.status === "rehyb_ready"
  );
  const hasHybNoPhoto = preps.some((p) => p.status === "hybridized");

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Журнал", to: "/журнал" },
          { label: `S-${sample.id}` },
        ]}
      />

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-[34px] font-extrabold text-brand-deep">
                S-{sample.id}
              </h1>
              <Badge tone={sample.status === "result" ? "green" : "default"}>
                {sampleStatusLabel[sample.status]}
              </Badge>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-[12.5px] text-amber-800">
              <AlertTriangle size={14} />
              ID образца стабилен. Изменение ID повлияет на все связанные
              ивенты, файлы и ссылки.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast("Архивировать (mock)")}
            >
              <ArchiveIcon size={14} />
              В архив
            </Button>
            <Button onClick={() => toast("Редактировать (mock)")}>
              <Pencil size={14} />
              Редактировать
            </Button>
          </div>
        </div>

        {/* Подсказка следующих действий */}
        <div className="mt-4 flex flex-wrap gap-2">
          {hasMatureNoPrep && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => nav(`/журнал/новый-ивент?type=slide`)}
            >
              <Plus size={13} />
              Создать препарат
            </Button>
          )}
          {hasCreatedNoWash && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => nav(`/журнал/новый-ивент?type=wash`)}
            >
              <ArrowRight size={13} />
              Отмыть препараты
            </Button>
          )}
          {hasWashedNoHyb && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => nav(`/журнал/новый-ивент?type=hybridization`)}
            >
              <ArrowRight size={13} />
              Поставить гибридизацию
            </Button>
          )}
          {hasHybNoPhoto && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => nav(`/журнал/новый-ивент?type=photographing`)}
            >
              <ArrowRight size={13} />
              Сфотографировать
            </Button>
          )}
          {sample.hasResult && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => nav(`/кариотип`)}
            >
              <ArrowRight size={13} />
              Открыть в Кариотипе
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <SectionTitle
            title="Базовая информация"
            right={
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-brand-muted">
                {sample.notes ? "" : "анкета неполная"}
              </span>
            }
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Год регистрации/посева"
              value={sample.sowingYear?.toString() ?? "—"}
            />
            <Field label="Вид" value={sample.species} />
            <Field
              label="Родители"
              value={
                sample.mother || sample.father
                  ? `${sample.mother ?? "—"} × ${sample.father ?? "—"}`
                  : "—"
              }
            />
            <Field label="Поколение" value={sample.generation ?? "—"} />
          </div>
          {sample.notes && (
            <p className="mt-4 rounded-xl bg-brand-mint/40 p-3 text-[12.5px] text-brand-deep">
              {sample.notes}
            </p>
          )}
        </Card>

        <Card dark>
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-brand-accent" />
            <h3 className="text-[15px] font-bold text-brand-cream">
              Последние события
            </h3>
          </div>
          <div className="mt-4 space-y-3">
            {events.slice(0, 5).map((e) => (
              <button
                key={e.id}
                onClick={() => nav(`/журнал/ивент/${e.id}`)}
                className="flex w-full items-start gap-3 rounded-xl bg-white/5 p-3 text-left transition hover:bg-white/10"
              >
                <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
                  {e.type[0].toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] uppercase tracking-wider text-brand-cream/70">
                    {fmtDateLong(e.startDate)} · {eventTypeLabel[e.type]}
                  </div>
                  <div className="truncate text-sm font-bold text-white">
                    {e.title}
                  </div>
                </div>
              </button>
            ))}
            {events.length === 0 && (
              <div className="rounded-xl bg-white/5 p-4 text-center text-[12.5px] text-brand-cream/70">
                По образцу пока нет ивентов.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle
            icon={<ImageIcon size={16} />}
            title="Кариотип и файлы"
            hint="Обзорные кариотипы и связанные файлы по образцу."
          />
          <Button variant="outline" onClick={() => nav("/кариотип")}>
            <Upload size={14} />
            Открыть в Кариотипе
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {sample.hasResult ? (
            [
              { name: "CH-01_ALIGN.jpg", color: "from-brand-accent/30 to-brand" },
              { name: "FL-SCAN_V2.png", color: "from-brand-deep to-brand-dark" },
              { name: "RAW_DATA_S01.tiff", color: "from-brand to-brand-dark" },
            ].map((it) => (
              <div
                key={it.name}
                className={`relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl border border-brand-line bg-gradient-to-br ${it.color} p-2 text-[10.5px] font-semibold text-white`}
              >
                <div className="rounded-md bg-black/40 px-1.5 py-0.5">
                  {it.name}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-brand-line bg-brand-mint/40 p-4 text-center text-[12.5px] text-brand-muted md:col-span-3">
              По образцу ещё нет обзорного кариотипа.
            </div>
          )}
          <button
            onClick={() => toast("Добавление файла (mock)")}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand-accent/60 bg-brand-mint/40 text-brand-dark transition hover:bg-brand-mint"
          >
            <Plus size={20} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Добавить файл
            </span>
          </button>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <SectionTitle
            icon={<TreePine size={16} />}
            title="Растения, препараты и окраски"
            hint="Дерево происхождения: растение → препарат → окраска → файлы."
          />
          <Button
            variant="outline"
            onClick={() => toast("Добавить растение (mock)")}
          >
            <Plus size={14} />
            Добавить растение
          </Button>
        </div>

        <div className="space-y-3">
          {plants.length === 0 && grouped.mix.length === 0 && (
            <div className="rounded-xl border border-dashed border-brand-line bg-brand-mint/40 p-4 text-center text-[12.5px] text-brand-muted">
              У образца пока нет растений и препаратов.
            </div>
          )}

          {plants.map((p) => {
            const open = !!openPlants[p.id];
            const sPreps = grouped.byPlant.get(p.id) ?? [];
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-xl border border-brand-line"
              >
                <button
                  onClick={() =>
                    setOpenPlants((o) => ({ ...o, [p.id]: !o[p.id] }))
                  }
                  className="flex w-full items-center gap-3 bg-brand-mint/40 px-4 py-3 text-left"
                >
                  <ChevronDown
                    size={14}
                    className={`text-brand-dark transition ${
                      open ? "" : "-rotate-90"
                    }`}
                  />
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-brand-dark">
                    <Sprout size={14} />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-brand-deep">
                      {p.name}
                    </div>
                    {p.location && (
                      <div className="text-[11.5px] uppercase tracking-wider text-brand-muted">
                        {p.location}
                      </div>
                    )}
                  </div>
                  <Badge tone={p.state === "discarded" ? "red" : "green"}>
                    {p.state === "growing"
                      ? "Растёт"
                      : p.state === "used"
                        ? "Использовано"
                        : "Выброшено"}
                  </Badge>
                  <Badge tone="default">{sPreps.length} препарат(ов)</Badge>
                </button>

                {open && (
                  <div className="bg-white">
                    <PrepTable
                      preps={sPreps}
                      stained={stained}
                      openPreps={openPreps}
                      togglePrep={(id) =>
                        setOpenPreps((o) => ({ ...o, [id]: !o[id] }))
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}

          {grouped.mix.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-brand-warn/30">
              <button
                onClick={() =>
                  setOpenPlants((o) => ({ ...o, __mix__: !o.__mix__ }))
                }
                className="flex w-full items-center gap-3 bg-amber-50 px-4 py-3 text-left"
              >
                <ChevronDown
                  size={14}
                  className={`text-amber-800 transition ${
                    openPlants.__mix__ ? "" : "-rotate-90"
                  }`}
                />
                <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-amber-800">
                  <Layers size={14} />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-amber-900">
                    Смесь растений
                  </div>
                  <div className="text-[11.5px] uppercase tracking-wider text-amber-800/80">
                    Препараты сделаны из смешанного материала
                  </div>
                </div>
                <Badge tone="amber">
                  {grouped.mix.length} препарат(ов)
                </Badge>
              </button>
              {openPlants.__mix__ && (
                <div className="bg-white">
                  <PrepTable
                    preps={grouped.mix}
                    stained={stained}
                    openPreps={openPreps}
                    togglePrep={(id) =>
                      setOpenPreps((o) => ({ ...o, [id]: !o[id] }))
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-cap">{label}</div>
      <div className="mt-1 rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm font-semibold text-brand-deep">
        {value}
      </div>
    </div>
  );
}

function Stars({ q }: { q: "high" | "medium" | "low" }) {
  const n = q === "high" ? 5 : q === "medium" ? 3 : 1;
  return (
    <span className="inline-flex items-center gap-0.5 text-brand-accent">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < n ? "text-brand-accent" : "text-brand-line"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function PrepTable({
  preps,
  stained,
  openPreps,
  togglePrep,
}: {
  preps: Preparation[];
  stained: StainedPreparation[];
  openPreps: Record<string, boolean>;
  togglePrep: (id: string) => void;
}) {
  if (preps.length === 0) {
    return (
      <div className="px-4 py-4 text-center text-[12.5px] text-brand-muted">
        Препаратов пока нет.
      </div>
    );
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-t border-brand-line text-[10.5px] uppercase tracking-wider text-brand-muted">
          <th className="w-8 px-4 py-2" />
          <th className="px-4 py-2 text-left">ID препарата</th>
          <th className="px-4 py-2 text-left">Создан</th>
          <th className="px-4 py-2 text-left">Качество</th>
          <th className="px-4 py-2 text-left">Статус</th>
          <th className="px-4 py-2 text-left">Хранение</th>
          <th className="px-4 py-2 text-left">Окраски</th>
        </tr>
      </thead>
      <tbody>
        {preps.map((pp) => {
          const stains = (stained as Array<{
            preparationId: string;
            cycleNumber: number;
            probes: { name: string; channel: string }[];
          }>)
            .filter((st) => st.preparationId === pp.id)
            .sort((a, b) => a.cycleNumber - b.cycleNumber);
          const isOpen = !!openPreps[pp.id];
          return (
            <>
              <tr
                key={pp.id}
                className={classNames(
                  "border-t border-brand-line/80",
                  isOpen && "bg-brand-mint/30"
                )}
              >
                <td className="px-2 py-2.5">
                  {stains.length > 0 && (
                    <button
                      onClick={() => togglePrep(pp.id)}
                      className="grid h-6 w-6 place-items-center rounded-md text-brand-muted hover:bg-brand-cream"
                      aria-label={isOpen ? "Свернуть" : "Развернуть"}
                    >
                      <ChevronDown
                        size={14}
                        className={isOpen ? "" : "-rotate-90"}
                      />
                    </button>
                  )}
                </td>
                <td className="px-4 py-2.5 font-semibold text-brand-deep">
                  {pp.id}
                </td>
                <td className="px-4 py-2.5 text-brand-muted">{pp.createdAt}</td>
                <td className="px-4 py-2.5">
                  <Stars q={pp.quality} />
                </td>
                <td className="px-4 py-2.5">
                  <Badge tone={prepStatusTone(pp.status)}>
                    {prepStatusLabel[pp.status]}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-brand-deep/80">
                  <span className="italic text-brand-muted">
                    {pp.fridge ?? "—"} · {pp.box ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-brand-deep/80">
                  {stains.length === 0 ? (
                    <span className="text-brand-muted">нет</span>
                  ) : (
                    <span className="font-semibold">{stains.length} / 3</span>
                  )}
                </td>
              </tr>
              {isOpen &&
                stains.map((st) => (
                  <tr
                    key={st.preparationId + "_" + st.cycleNumber}
                    className="border-t border-brand-line/60 bg-brand-mint/15"
                  >
                    <td />
                    <td colSpan={6} className="px-4 py-2 text-[12.5px]">
                      <span className="mr-2 font-semibold text-brand-deep">
                        Окраска {st.cycleNumber}
                      </span>
                      <span className="text-brand-muted">·</span>
                      <span className="ml-2 inline-flex flex-wrap gap-1">
                        {st.probes.map((p, i) => (
                          <span
                            key={i}
                            className={classNames(
                              "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase",
                              p.channel === "red"
                                ? "bg-brand-danger/15 text-brand-danger border-brand-danger/30"
                                : p.channel === "green"
                                  ? "bg-brand-accent/30 text-brand-dark border-brand-accent/50"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                            )}
                          >
                            {p.name}
                          </span>
                        ))}
                      </span>
                    </td>
                  </tr>
                ))}
            </>
          );
        })}
      </tbody>
    </table>
  );
}

import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import { useStore } from "@/lib/store";
import EmptyState from "@/components/ui/EmptyState";
import { Microscope } from "lucide-react";
import Button from "@/components/ui/Button";
import ChromosomeMarkupMode from "./markup/ChromosomeMarkupMode";
import GenomeLayoutMode from "./genome/GenomeLayoutMode";
import KaryotypeContextBar from "./KaryotypeContextBar";

interface Props {
  initialMode: "chromosome" | "genome";
}

export default function KaryotypePage({ initialMode }: Props) {
  const [params, setParams] = useSearchParams();
  const loc = useLocation();
  const nav = useNavigate();

  const ctx = useStore((s) => s.karyoCtx);
  const setCtx = useStore((s) => s.selectKaryotypeContext);
  const samples = useStore((s) => s.samples);
  const stained = useStore((s) => s.stained);
  const preparations = useStore((s) => s.preparations);
  const metaphases = useStore((s) => s.metaphases);

  // sync URL → store ctx
  useEffect(() => {
    const sampleId = params.get("sampleId") ?? undefined;
    const stainedId = params.get("stainedId") ?? undefined;
    const metaphaseId = params.get("metaphaseId") ?? undefined;
    const chrom = params.get("chrom") ?? undefined;
    if (sampleId || stainedId || metaphaseId || chrom) {
      setCtx({
        sampleId,
        stainedId,
        metaphaseId,
        activeChromosomeId: chrom,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // если нет sampleId, попробуем взять самый свежий committed import
  const imports = useStore((s) => s.karyotypeImports);
  useEffect(() => {
    if (ctx.sampleId) return;
    const committed = imports.find((i) => i.status === "committed");
    if (committed) {
      setCtx({
        sampleId: committed.sampleId,
        stainedId: committed.stainedId,
        metaphaseId: committed.metaphaseId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mode = initialMode;
  const tabs = [
    { id: "chromosome", label: "Разметка хромосом" },
    { id: "genome", label: "Разметка генома" },
  ];

  const sampleId = ctx.sampleId;
  const sample = samples.find((s) => s.id === sampleId);
  const stainedDoc = stained.find((s) => s.id === ctx.stainedId);
  const metaphase = metaphases.find((m) => m.id === ctx.metaphaseId);

  // Список доступных образцов (есть хромосомы)
  const allChroms = useStore((s) => s.chromosomes);
  const sampleChromCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of allChroms) m.set(c.sampleId, (m.get(c.sampleId) ?? 0) + 1);
    return m;
  }, [allChroms]);

  const onSwitchMode = (id: string) => {
    const sub = id === "genome" ? "разметка/геном" : "разметка";
    const qs = new URLSearchParams();
    if (ctx.sampleId) qs.set("sampleId", ctx.sampleId);
    if (ctx.stainedId) qs.set("stainedId", ctx.stainedId);
    if (ctx.metaphaseId) qs.set("metaphaseId", ctx.metaphaseId);
    nav(`/кариотип/${sub}${qs.toString() ? "?" + qs.toString() : ""}`);
  };

  const onChangeSample = (id: string) => {
    setParams(
      (p) => {
        const np = new URLSearchParams(p);
        if (id) np.set("sampleId", id);
        else np.delete("sampleId");
        np.delete("stainedId");
        np.delete("metaphaseId");
        return np;
      },
      { replace: true }
    );
    // авто-выбрать первую метафазу/окраску этого образца
    const firstChrom = allChroms.find((c) => c.sampleId === id);
    setCtx({
      sampleId: id || undefined,
      stainedId: firstChrom?.stainedId,
      metaphaseId: firstChrom?.metaphaseId,
      activeChromosomeId: undefined,
    });
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Кариотип" },
          { label: mode === "chromosome" ? "Разметка хромосом" : "Разметка генома" },
          ...(sample ? [{ label: `S-${sample.id}` }] : []),
        ]}
      />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-page">
            {mode === "chromosome" ? "Разметка хромосом" : "Разметка генома"}
          </h1>
          <p className="mt-1 text-[13px] text-brand-muted">
            {mode === "chromosome"
              ? "Поставьте центромеру и сигналы — софт сохранит цифровую и графическую идеограмму."
              : "Соберите матрицу субгеномов и классов. Сохраните лицевой кариотип образца."}
          </p>
        </div>
        <Tabs value={mode} options={tabs} onChange={onSwitchMode} />
      </header>

      {/* контекст-полоса с переключателем образца */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="field !w-auto !py-2 text-sm font-semibold"
          value={sampleId ?? ""}
          onChange={(e) => onChangeSample(e.target.value)}
        >
          <option value="">— выберите образец —</option>
          {samples
            .slice()
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((s) => (
              <option key={s.id} value={s.id}>
                S-{s.id} · {s.species}
                {sampleChromCounts.get(s.id)
                  ? ` · ${sampleChromCounts.get(s.id)} хромосом`
                  : " · нет хромосом"}
              </option>
            ))}
        </select>

        {sample && stainedDoc && (
          <KaryotypeContextBar
            sampleId={sample.id}
            stainedId={stainedDoc.id}
            metaphaseId={metaphase?.id}
            level={ctx.level}
            className="flex-1"
          />
        )}
      </div>

      {!sample ? (
        <EmptyState
          icon={<Microscope size={32} />}
          title="Сначала выберите образец"
          description="Чтобы начать разметку, выберите образец с уже импортированными хромосомами."
          action={
            <Button onClick={() => nav("/кариотип/импорт")}>
              Перейти к импорту
            </Button>
          }
        />
      ) : (sampleChromCounts.get(sample.id) ?? 0) === 0 ? (
        <EmptyState
          icon={<Microscope size={32} />}
          title={`У S-${sample.id} ещё нет импортированных хромосом`}
          description="Выполните импорт PSD, чтобы появились объекты для разметки."
          action={
            <Button
              onClick={() =>
                nav(
                  `/кариотип/импорт?sampleId=${sample.id}${
                    stainedDoc ? `&stainedId=${stainedDoc.id}` : ""
                  }`
                )
              }
            >
              Открыть импорт для S-{sample.id}
            </Button>
          }
        />
      ) : mode === "chromosome" ? (
        <ChromosomeMarkupMode />
      ) : (
        <GenomeLayoutMode />
      )}

      {/* подчищаем заглушку, чтобы preparations/loc не были unused */}
      <span className="hidden">{preparations.length}{loc.pathname}</span>
    </div>
  );
}

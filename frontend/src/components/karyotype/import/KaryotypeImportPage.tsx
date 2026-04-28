import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, FileSearch, Layers as LayersIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Select from "@/components/ui/Select";
import SectionTitle from "@/components/ui/SectionTitle";
import EmptyState from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import KaryotypeContextCard from "./KaryotypeContextCard";
import PsdDropzoneMock from "./PsdDropzoneMock";
import ImportLayerGrid from "./ImportLayerGrid";
import ImportVerificationLog from "./ImportVerificationLog";
import ImportCommitPanel from "./ImportCommitPanel";
import StatusPill from "@/components/ui/StatusPill";

export default function KaryotypeImportPage() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();

  const samples = useStore((s) => s.samples);
  const stained = useStore((s) => s.stained);
  const preparations = useStore((s) => s.preparations);
  const imports = useStore((s) => s.karyotypeImports);
  const layers = useStore((s) => s.chromosomeLayers);
  const ctx = useStore((s) => s.karyoCtx);

  const selectKaryotypeContext = useStore((s) => s.selectKaryotypeContext);
  const mockReadPsd = useStore((s) => s.mockReadPsd);
  const toggleImportLayer = useStore((s) => s.toggleImportLayer);
  const acknowledgeImportWarning = useStore((s) => s.acknowledgeImportWarning);
  const commitKaryotypeImport = useStore((s) => s.commitKaryotypeImport);

  // sync URL → store context
  useEffect(() => {
    const sampleId = params.get("sampleId") ?? undefined;
    const stainedId = params.get("stainedId") ?? undefined;
    const prepId = params.get("prepId") ?? undefined;
    if (sampleId || stainedId || prepId) {
      selectKaryotypeContext({
        sampleId,
        stainedId,
        preparationId: prepId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // выбор образца
  const sampleId = ctx.sampleId;
  const stainedId = ctx.stainedId;

  // фильтруем окрашенные препараты этого образца
  const sampleStained = useMemo(() => {
    if (!sampleId) return [];
    const sampleStainedIds = stained
      .filter((s) => {
        const prep = preparations.find((p) => p.id === s.preparationId);
        return prep?.sampleId === sampleId;
      })
      .map((s) => s.id);
    return stained.filter((s) => sampleStainedIds.includes(s.id));
  }, [sampleId, stained, preparations]);

  // ищем существующий import для выбранного контекста
  const activeImport = useMemo(() => {
    if (!sampleId) return undefined;
    if (stainedId) {
      const exact = imports.find(
        (i) => i.sampleId === sampleId && i.stainedId === stainedId
      );
      if (exact) return exact;
    }
    return imports.find((i) => i.sampleId === sampleId);
  }, [imports, sampleId, stainedId]);

  // если переключили окраску — сменим её и в импорте
  useEffect(() => {
    if (activeImport && stainedId && activeImport.stainedId !== stainedId) {
      // оставляем импорт как есть, но контекст уже синхронизирован
    }
  }, [activeImport, stainedId]);

  const importLayers = useMemo(
    () =>
      activeImport
        ? layers.filter((l) => activeImport.layerIds.includes(l.id))
        : [],
    [layers, activeImport]
  );

  const handleSampleChange = (id: string) => {
    setParams(
      (p) => {
        const np = new URLSearchParams(p);
        np.set("sampleId", id);
        np.delete("stainedId");
        return np;
      },
      { replace: true }
    );
    selectKaryotypeContext({
      sampleId: id || undefined,
      stainedId: undefined,
      preparationId: undefined,
    });
  };

  const handleStainedChange = (id: string) => {
    setParams(
      (p) => {
        const np = new URLSearchParams(p);
        if (id) np.set("stainedId", id);
        else np.delete("stainedId");
        return np;
      },
      { replace: true }
    );
    const st = stained.find((s) => s.id === id);
    selectKaryotypeContext({
      stainedId: id || undefined,
      preparationId: st?.preparationId,
    });
  };

  const handleReadPsd = () => {
    if (!activeImport) {
      toast.error("Сначала выберите образец и окрашенный препарат");
      return;
    }
    mockReadPsd(activeImport.id, activeImport.psdFileName);
    toast.success("PSD прочитан — проверьте слои справа");
  };

  const handleCommit = () => {
    if (!activeImport) return;
    const metaphaseId = commitKaryotypeImport(activeImport.id);
    if (!metaphaseId) {
      toast.error("Подтвердите все предупреждения и выберите контекст");
      return;
    }
    const includedCount = importLayers.filter(
      (l) => l.kind === "chromosome" && l.included
    ).length;
    toast.success(`Сохранено ${includedCount} хромосом`);
  };

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Кариотип" },
          { label: "Импорт" },
          { label: activeImport?.psdFileName ?? "Новый импорт" },
        ]}
      />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-page">Импорт PSD</h1>
          <p className="mt-1 text-[13px] text-brand-muted">
            Загрузите PSD с метафазной пластинкой. Каждый слой — отдельная
            хромосома. После сохранения они появятся в разметке.
          </p>
        </div>
        {activeImport && (
          <div className="flex items-center gap-2">
            <StatusPill
              status={
                activeImport.status === "committed"
                  ? "completed"
                  : activeImport.status === "warning" ||
                      activeImport.status === "error"
                    ? "scheduled"
                    : activeImport.status === "preview"
                      ? "active"
                      : "draft"
              }
              label={importStatusLabel(activeImport.status)}
            />
            {activeImport.status === "committed" && (
              <Button
                variant="dark"
                size="sm"
                onClick={() =>
                  nav(
                    `/кариотип/разметка-хромосом?sampleId=${activeImport.sampleId}&metaphaseId=${activeImport.metaphaseId}`
                  )
                }
              >
                <ArrowRight size={13} />
                Перейти к разметке хромосом
              </Button>
            )}
          </div>
        )}
      </header>

      {/* контекст-селекторы */}
      <Card>
        <SectionTitle
          icon={<FileSearch size={16} />}
          title="Что импортируем"
          hint="Выберите образец и окрашенный препарат, к которому относится PSD-файл."
        />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Select
            label="Образец"
            value={sampleId ?? ""}
            onChange={(e) => handleSampleChange(e.target.value)}
          >
            <option value="">— выберите —</option>
            {samples
              .slice()
              .sort((a, b) => a.id.localeCompare(b.id))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  S-{s.id} · {s.species}
                </option>
              ))}
          </Select>
          <Select
            label="Окрашенный препарат"
            value={stainedId ?? ""}
            onChange={(e) => handleStainedChange(e.target.value)}
            disabled={!sampleId || sampleStained.length === 0}
          >
            <option value="">
              {sampleStained.length === 0
                ? "у образца пока нет окрасок"
                : "— выберите —"}
            </option>
            {sampleStained.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} ·{" "}
                {s.probes.map((p) => p.name).join(" + ")} ·{" "}
                {s.hybridizationDate}
              </option>
            ))}
          </Select>
          <div className="flex flex-col justify-end">
            <span className="label-cap mb-1.5">Подсказка</span>
            <div className="rounded-xl border border-brand-line bg-brand-mint/40 px-3 py-2.5 text-[12.5px] text-brand-deep/80">
              По имени PSD <span className="font-semibold">{`<образец>-<зонды>-<фото>-<координаты>.psd`}</span> программа подскажет совпадение.
            </div>
          </div>
        </div>
      </Card>

      {!sampleId || !stainedId ? (
        <EmptyState
          icon={<LayersIcon size={28} />}
          title="Сначала выберите образец и окраску"
          description="Импорт идёт строго в окрашенный препарат, чтобы каждая хромосома сохранила своё происхождение."
        />
      ) : !activeImport ? (
        <Card>
          <p className="text-sm text-brand-muted">
            Для этого образца ещё нет открытого импорта. Используйте drop-зону —
            создание импорта произойдёт автоматически (mock).
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
          <div className="space-y-5">
            <KaryotypeContextCard
              sampleId={activeImport.sampleId}
              stainedId={activeImport.stainedId}
              preparationId={activeImport.preparationId}
            />
            <PsdDropzoneMock
              fileName={activeImport.psdFileName}
              status={activeImport.status}
              onRead={handleReadPsd}
            />
          </div>
          <div className="space-y-5">
            <ImportLayerGrid
              layers={importLayers}
              onToggle={(id) => toggleImportLayer(id)}
              status={activeImport.status}
            />
            <ImportVerificationLog history={activeImport.history} />
            <ImportCommitPanel
              importDoc={activeImport}
              layers={importLayers}
              onAcknowledge={(wid) =>
                acknowledgeImportWarning(activeImport.id, wid)
              }
              onCommit={handleCommit}
              onGoMarkup={() =>
                nav(
                  `/кариотип/разметка-хромосом?sampleId=${activeImport.sampleId}&metaphaseId=${activeImport.metaphaseId}`
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function importStatusLabel(s: string) {
  switch (s) {
    case "empty":
      return "PSD ещё не прочитан";
    case "preview":
      return "Готов к сохранению";
    case "warning":
      return "Есть предупреждения";
    case "committed":
      return "Сохранено";
    case "error":
      return "Ошибка";
    default:
      return s;
  }
}

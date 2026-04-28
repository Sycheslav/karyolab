import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import type { ChromosomeObject, KaryotypeLevel } from "@/lib/types";
import ChromosomeBrowser from "./ChromosomeBrowser";
import ChromosomeCanvas from "./ChromosomeCanvas";
import IdeogramScaleEditor from "./IdeogramScaleEditor";
import IdeogramPreview from "./IdeogramPreview";
import UnsavedChangesDialog from "./UnsavedChangesDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Layers } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ChromosomeMarkupMode() {
  const ctx = useStore((s) => s.karyoCtx);
  const setCtx = useStore((s) => s.selectKaryotypeContext);
  const chromosomes = useStore((s) => s.chromosomes);
  const ideograms = useStore((s) => s.ideograms);
  const setLevel = (level: KaryotypeLevel) => setCtx({ level });
  const saveIdeogram = useStore((s) => s.saveIdeogram);
  const resetIdeogramDraft = useStore((s) => s.resetIdeogramDraft);
  const nav = useNavigate();

  const [pendingChromosomeId, setPendingChromosomeId] = useState<string | null>(
    null
  );

  // отбираем хромосомы для этого образца + уровня
  const sampleChromosomes = useMemo(() => {
    if (!ctx.sampleId) return [];
    return chromosomes.filter((c) => {
      if (c.sampleId !== ctx.sampleId) return false;
      if (ctx.level === "metaphase" && ctx.metaphaseId)
        return c.metaphaseId === ctx.metaphaseId;
      if (ctx.level === "hybridization" && ctx.stainedId)
        return c.stainedId === ctx.stainedId;
      return true;
    });
  }, [chromosomes, ctx.sampleId, ctx.metaphaseId, ctx.stainedId, ctx.level]);

  // активная хромосома
  const active = useMemo(
    () =>
      ctx.activeChromosomeId
        ? sampleChromosomes.find((c) => c.id === ctx.activeChromosomeId)
        : sampleChromosomes[0],
    [sampleChromosomes, ctx.activeChromosomeId]
  );

  useEffect(() => {
    if (active && !ctx.activeChromosomeId) {
      setCtx({ activeChromosomeId: active.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  // Признак «есть несохранённые правки» — флаг dirty на идеограмме
  const hasUnsaved = useMemo(() => {
    if (!active) return false;
    const idg = ideograms.find((i) => i.chromosomeId === active.id);
    return !!idg?.dirty;
  }, [ideograms, active]);

  const trySwitchTo = (id: string) => {
    if (id === active?.id) return;
    if (hasUnsaved) {
      setPendingChromosomeId(id);
      return;
    }
    setCtx({ activeChromosomeId: id });
  };

  const handleConfirmSwitch = (saveFirst: boolean) => {
    if (!active || !pendingChromosomeId) {
      setPendingChromosomeId(null);
      return;
    }
    if (saveFirst) {
      saveIdeogram(active.id);
      toast.success("Идеограмма сохранена");
    } else {
      resetIdeogramDraft(active.id);
    }
    setCtx({ activeChromosomeId: pendingChromosomeId });
    setPendingChromosomeId(null);
  };

  const onNextWithoutIdeogram = () => {
    if (!active) return;
    const next = sampleChromosomes.find(
      (c) => !c.ideogramId && c.id !== active.id
    );
    if (next) {
      trySwitchTo(next.id);
    } else {
      toast("У всех хромосом есть идеограмма", { icon: "✨" });
    }
  };

  const ideogram = active
    ? ideograms.find((i) => i.chromosomeId === active.id)
    : undefined;

  if (sampleChromosomes.length === 0) {
    return (
      <EmptyState
        icon={<Layers size={28} />}
        title="Для текущего контекста нет хромосом"
        description="Проверьте уровень (метафаза/гибридизация) или импортируйте PSD."
        action={
          <Button onClick={() => nav("/кариотип/импорт")}>
            Перейти к импорту
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_1fr_360px]">
      <ChromosomeBrowser
        chromosomes={sampleChromosomes}
        activeId={active?.id}
        level={ctx.level}
        onChangeLevel={setLevel}
        onSelect={trySwitchTo}
      />

      {active ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
          <ChromosomeCanvas chromosome={active as ChromosomeObject} />
          <IdeogramScaleEditor chromosome={active as ChromosomeObject} />
        </div>
      ) : (
        <EmptyState
          icon={<Layers size={28} />}
          title="Выберите хромосому слева"
        />
      )}

      {active && (
        <IdeogramPreview
          chromosome={active as ChromosomeObject}
          ideogram={ideogram}
          dirty={hasUnsaved}
          onSave={() => {
            saveIdeogram(active.id);
            toast.success(`Идеограмма сохранена · ${active.temporaryName}`);
          }}
          onReset={() => {
            resetIdeogramDraft(active.id);
            toast("Несохранённые правки сброшены");
          }}
          onNext={onNextWithoutIdeogram}
        />
      )}

      {pendingChromosomeId && (
        <UnsavedChangesDialog
          onSave={() => handleConfirmSwitch(true)}
          onDiscard={() => handleConfirmSwitch(false)}
          onCancel={() => setPendingChromosomeId(null)}
        />
      )}
    </div>
  );
}

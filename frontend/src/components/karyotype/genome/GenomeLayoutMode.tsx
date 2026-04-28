import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import GenomeChromosomeBank from "./GenomeChromosomeBank";
import GenomeMatrix from "./GenomeMatrix";
import GenomeRightPanel from "./GenomeRightPanel";
import AutoSortPreviewDialog from "./AutoSortPreviewDialog";
import type { GenomeAssignment } from "@/lib/types";

export default function GenomeLayoutMode() {
  const ctx = useStore((s) => s.karyoCtx);
  const setCtx = useStore((s) => s.selectKaryotypeContext);
  const layouts = useStore((s) => s.genomeLayouts);
  const chromosomes = useStore((s) => s.chromosomes);
  const ensureGenomeLayout = useStore((s) => s.ensureGenomeLayout);
  const assign = useStore((s) => s.assignChromosomeToCell);
  const unassign = useStore((s) => s.unassignChromosome);
  const addSubgenome = useStore((s) => s.addSubgenomeColumn);
  const removeSubgenome = useStore((s) => s.removeSubgenomeColumn);
  const applyAutoSort = useStore((s) => s.applyAutoSort);
  const saveLayout = useStore((s) => s.saveGenomeLayout);
  const createSampleKaryotype = useStore((s) => s.createSampleKaryotype);
  const approveKaryotype = useStore((s) => s.approveSampleKaryotype);
  const sampleKaryotypes = useStore((s) => s.sampleKaryotypes);
  const nav = useNavigate();

  const [selectedChromId, setSelectedChromId] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    sub: string;
    cls: number;
  } | null>(null);
  const [autoSortPreview, setAutoSortPreview] = useState<GenomeAssignment[] | null>(null);

  const sampleId = ctx.sampleId!;
  const layoutId = useMemo(() => {
    if (!sampleId) return undefined;
    return ensureGenomeLayout(
      sampleId,
      ctx.level,
      ctx.metaphaseId,
      ctx.stainedId
    );
  }, [
    sampleId,
    ctx.level,
    ctx.metaphaseId,
    ctx.stainedId,
    ensureGenomeLayout,
  ]);

  const layout = layouts.find((l) => l.id === layoutId);

  // хромосомы для текущего контекста
  const sampleChromosomes = useMemo(() => {
    if (!sampleId) return [];
    return chromosomes.filter((c) => {
      if (c.sampleId !== sampleId) return false;
      if (ctx.level === "metaphase" && ctx.metaphaseId)
        return c.metaphaseId === ctx.metaphaseId;
      if (ctx.level === "hybridization" && ctx.stainedId)
        return c.stainedId === ctx.stainedId;
      return true;
    });
  }, [chromosomes, sampleId, ctx.level, ctx.metaphaseId, ctx.stainedId]);

  // существующий лицевой кариотип образца (если уже создан)
  const existingKaryotype = useMemo(
    () =>
      sampleKaryotypes.find(
        (k) =>
          k.sampleId === sampleId &&
          (!layout || k.layoutId === layout.id)
      ),
    [sampleKaryotypes, sampleId, layout]
  );

  useEffect(() => {
    setSelectedChromId(null);
    setSelectedCell(null);
  }, [layoutId]);

  if (!layout) return null;

  const assignedIds = new Set(layout.assignments.map((a) => a.chromosomeId));
  const bankChromosomes = sampleChromosomes.filter(
    (c) => c.status !== "excluded"
  );
  const unassigned = bankChromosomes.filter((c) => !assignedIds.has(c.id));

  const cellChromosomes = (sub: string, cls: number) =>
    layout.assignments
      .filter((a) => a.subgenome === sub && a.chromosomeClass === cls)
      .map((a) => sampleChromosomes.find((c) => c.id === a.chromosomeId)!)
      .filter(Boolean);

  const onCellClick = (sub: string, cls: number) => {
    setSelectedCell({ sub, cls });
    if (selectedChromId) {
      assign(layout.id, selectedChromId, sub, cls);
      toast.success(`${selectedChromId.split("-").pop()} → ${sub}${cls}`);
      setSelectedChromId(null);
    }
  };

  const onChromClick = (id: string) => {
    if (selectedChromId === id) {
      setSelectedChromId(null);
      return;
    }
    setSelectedChromId(id);
    if (selectedCell) {
      assign(layout.id, id, selectedCell.sub, selectedCell.cls);
      toast.success(`${id.split("-").pop()} → ${selectedCell.sub}${selectedCell.cls}`);
      setSelectedChromId(null);
    }
  };

  const onAutoSortPreview = () => {
    // покажем preview: какие ещё хромосомы добавятся
    const preview: GenomeAssignment[] = [];
    for (const c of bankChromosomes) {
      if (
        c.subgenome &&
        c.chromosomeClass &&
        layout.subgenomes.includes(c.subgenome) &&
        !assignedIds.has(c.id)
      ) {
        preview.push({
          chromosomeId: c.id,
          subgenome: c.subgenome,
          chromosomeClass: c.chromosomeClass,
        });
      }
    }
    setAutoSortPreview(preview);
  };

  const onAutoSortApply = () => {
    if (!autoSortPreview) return;
    const added = applyAutoSort(layout.id);
    setAutoSortPreview(null);
    toast.success(`Разложено по классам: +${added}`);
  };

  const onSave = () => {
    saveLayout(layout.id);
    toast.success("Разметка сохранена как черновик");
  };

  const onMakeKaryotype = () => {
    const id = createSampleKaryotype(layout.id);
    if (!id) {
      toast.error("Не удалось сформировать кариотип");
      return;
    }
    toast.success("Кариотип образца сформирован — на проверку");
  };

  const onApprove = () => {
    if (!existingKaryotype) {
      const id = createSampleKaryotype(layout.id);
      if (id) approveKaryotype(id);
    } else {
      approveKaryotype(existingKaryotype.id);
    }
    toast.success("Кариотип утверждён · образец помечен «есть результат»");
  };

  const onGoExport = () => {
    nav(`/кариотип/экспорт?sampleId=${sampleId}`);
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr_340px]">
      <GenomeChromosomeBank
        chromosomes={unassigned}
        totalCount={bankChromosomes.length}
        assignedCount={layout.assignments.length}
        selectedId={selectedChromId}
        onSelect={onChromClick}
        level={ctx.level}
        onChangeLevel={(lvl) => setCtx({ level: lvl })}
      />

      <GenomeMatrix
        layout={layout}
        cellChromosomes={cellChromosomes}
        selectedCell={selectedCell}
        selectedChromId={selectedChromId}
        onCellClick={onCellClick}
        onChromClick={onChromClick}
        onAddSubgenome={() => addSubgenome(layout.id)}
        onRemoveSubgenome={(name) => removeSubgenome(layout.id, name)}
      />

      <GenomeRightPanel
        layout={layout}
        existingKaryotype={existingKaryotype}
        selectedCell={selectedCell}
        cellChromosomes={
          selectedCell
            ? cellChromosomes(selectedCell.sub, selectedCell.cls)
            : []
        }
        onUnassign={(chromId) => unassign(layout.id, chromId)}
        onAutoSort={onAutoSortPreview}
        onSave={onSave}
        onMakeKaryotype={onMakeKaryotype}
        onApprove={onApprove}
        onGoExport={onGoExport}
      />

      {autoSortPreview && (
        <AutoSortPreviewDialog
          preview={autoSortPreview}
          onCancel={() => setAutoSortPreview(null)}
          onApply={onAutoSortApply}
        />
      )}
    </div>
  );
}

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Layers as LayersIcon } from "lucide-react";
import type { ChromosomeLayer, KaryotypeImportStatus } from "@/lib/types";
import ChromosomeGlyph from "../ChromosomeGlyph";
import { classNames } from "@/lib/utils";

interface Props {
  layers: ChromosomeLayer[];
  onToggle: (layerId: string) => void;
  status: KaryotypeImportStatus;
}

export default function ImportLayerGrid({ layers, onToggle, status }: Props) {
  const total = layers.length;
  const chromosomes = layers.filter((l) => l.kind === "chromosome");
  const included = chromosomes.filter((l) => l.included).length;

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <LayersIcon size={16} className="text-brand-dark" />
        <h3 className="text-[14px] font-bold text-brand-deep">
          Найденные слои
        </h3>
        <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[11px] font-bold text-brand-dark">
          {total} слоёв · хромосом {included} / {chromosomes.length}
        </span>
        <span className="ml-auto text-[12px] text-brand-muted">
          Снимите галочку с фоновых и пустых слоёв перед сохранением.
        </span>
      </div>

      {layers.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={<LayersIcon size={28} />}
          title={
            status === "empty"
              ? "PSD ещё не прочитан"
              : "В PSD не найдено слоёв"
          }
          description={
            status === "empty"
              ? "Нажмите «Прочитать demo PSD» в зоне загрузки слева."
              : "Проверьте файл — возможно, в нём только фон или пустые маски."
          }
        />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {layers.map((l) => (
            <LayerCard key={l.id} layer={l} onToggle={() => onToggle(l.id)} />
          ))}
        </div>
      )}
    </Card>
  );
}

function LayerCard({
  layer,
  onToggle,
}: {
  layer: ChromosomeLayer;
  onToggle: () => void;
}) {
  const isChrom = layer.kind === "chromosome";
  const tone =
    layer.kind === "chromosome"
      ? "mint"
      : layer.kind === "background"
        ? "amber"
        : layer.kind === "garbage"
          ? "red"
          : "ghost";
  const kindLabel =
    layer.kind === "chromosome"
      ? "хромосома"
      : layer.kind === "background"
        ? "фон"
        : layer.kind === "garbage"
          ? "мусор"
          : "пустой слой";

  // mock-glyph только для chromosome
  return (
    <label
      className={classNames(
        "group flex cursor-pointer flex-col rounded-xl border bg-white p-3 transition",
        layer.included
          ? "border-brand-line hover:border-brand-accent"
          : "border-dashed border-brand-line bg-brand-mint/30 opacity-70 hover:opacity-100"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-brand"
          checked={layer.included}
          onChange={onToggle}
        />
        <Badge tone={tone}>{kindLabel}</Badge>
      </div>
      <div className="mt-2 flex h-[140px] items-center justify-center rounded-lg bg-slate-900/95 p-2">
        {isChrom ? (
          <ChromosomeGlyph
            chromosome={{
              id: layer.id,
              sampleId: "",
              metaphaseId: "",
              stainedId: "",
              sourceLayerId: layer.id,
              importId: layer.importId,
              temporaryName: layer.temporaryName,
              maskSizePx: layer.maskSizePx,
              imageSeed: layer.imageSeed,
              redSpots: (layer.imageSeed >> 1) % 3,
              greenSpots: (layer.imageSeed >> 2) % 4,
              centromereHint: 0.25 + ((layer.imageSeed % 50) / 100),
              status: "new",
            }}
            height={120}
            dark
          />
        ) : (
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            нет данных
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11.5px]">
        <span className="font-mono font-semibold text-brand-deep">
          {layer.temporaryName}
        </span>
        <span className="text-brand-muted">
          {layer.maskSizePx ? `${layer.maskSizePx}px` : "—"}
        </span>
      </div>
      {layer.warnings && layer.warnings.length > 0 && (
        <div className="mt-1 text-[10.5px] text-amber-700">
          {layer.warnings[0]}
        </div>
      )}
    </label>
  );
}

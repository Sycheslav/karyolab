import Card from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import type { ChromosomeObject } from "@/lib/types";
import ChromosomeGlyph from "../ChromosomeGlyph";
import { Ban, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Props {
  chromosome: ChromosomeObject;
}

/**
 * Центральная тёмная панель с оригинальной хромосомой,
 * её мета-данными и быстрыми действиями (исключить, отметить как сомнительную).
 */
export default function ChromosomeCanvas({ chromosome }: Props) {
  const ideogram = useStore((s) =>
    s.ideograms.find(
      (i) => i.chromosomeId === chromosome.id && !i.id.startsWith("IDG-DRAFT-")
    )
  );
  const setStatus = useStore((s) => s.setChromosomeStatus);
  const exclude = useStore((s) => s.excludeChromosome);

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-brand-line bg-brand-mint/40 px-4 py-2">
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-brand-muted">
            Объект
          </div>
          <div className="font-mono text-[14px] font-bold text-brand-deep">
            {chromosome.displayName ?? chromosome.temporaryName}
          </div>
        </div>
        <div className="text-right text-[11.5px] text-brand-muted">
          <div>{chromosome.maskSizePx} px</div>
          {chromosome.subgenome && chromosome.chromosomeClass && (
            <div className="font-semibold text-brand-deep">
              {chromosome.subgenome}{chromosome.chromosomeClass}
            </div>
          )}
        </div>
      </div>

      <div className="flex h-[420px] items-center justify-center bg-slate-950 p-6">
        <ChromosomeGlyph
          chromosome={chromosome}
          ideogram={ideogram}
          height={Math.min(360, chromosome.maskSizePx * 1.8)}
          width={Math.max(28, Math.round(chromosome.maskSizePx * 0.18 * 1.6))}
          dark
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-brand-line p-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setStatus(
              chromosome.id,
              chromosome.status === "doubtful" ? "in_work" : "doubtful"
            );
            toast(
              chromosome.status === "doubtful"
                ? "Сомнение снято"
                : "Помечена как сомнительная",
              { icon: chromosome.status === "doubtful" ? "✓" : "⚠️" }
            );
          }}
        >
          <Star size={13} />
          {chromosome.status === "doubtful" ? "Снять сомнение" : "Сомнительная"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const reason = window.prompt(
              "Причина исключения (опционально):",
              chromosome.excludeReason ?? ""
            );
            if (reason === null) return;
            exclude(chromosome.id, reason || "без причины");
            toast.success("Хромосома исключена из дальнейшей работы");
          }}
        >
          <Ban size={13} />
          Исключить
        </Button>
        <span className="ml-auto text-[11px] text-brand-muted">
          Импорт: <span className="font-mono">{chromosome.importId}</span>
        </span>
      </div>
    </Card>
  );
}

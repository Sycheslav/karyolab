import Button from "@/components/ui/Button";
import { Sparkles } from "lucide-react";
import type { GenomeAssignment } from "@/lib/types";
import { useStore } from "@/lib/store";

interface Props {
  preview: GenomeAssignment[];
  onApply: () => void;
  onCancel: () => void;
}

export default function AutoSortPreviewDialog({
  preview,
  onApply,
  onCancel,
}: Props) {
  const chromosomes = useStore((s) => s.chromosomes);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white">
            <Sparkles size={18} />
          </span>
          <div>
            <h3 className="text-[16px] font-bold text-brand-deep">
              Авто-раскладка по классам
            </h3>
            <p className="mt-1 text-[13px] text-brand-muted">
              Поместим в матрицу только те хромосомы, у которых уже есть
              субгеном и класс. Подтверждённые ячейки не трогаем.
            </p>
          </div>
        </div>

        <div className="mt-4 max-h-[260px] overflow-y-auto rounded-xl border border-brand-line">
          {preview.length === 0 ? (
            <div className="p-4 text-center text-[12px] text-brand-muted">
              Нет хромосом для авто-распределения. Сначала задайте субгеном/класс
              в режиме разметки хромосом.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-brand-mint/40 text-[11px] uppercase tracking-wider text-brand-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Хромосома</th>
                  <th className="px-3 py-2 text-left">→ Ячейка</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p) => {
                  const c = chromosomes.find((x) => x.id === p.chromosomeId);
                  return (
                    <tr key={p.chromosomeId} className="border-t border-brand-line">
                      <td className="px-3 py-2 font-mono text-[12px] text-brand-deep">
                        {c?.displayName ?? c?.temporaryName ?? p.chromosomeId}
                      </td>
                      <td className="px-3 py-2 text-[12px] font-bold text-brand-dark">
                        {p.subgenome}{p.chromosomeClass}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button variant="primary" onClick={onApply} disabled={preview.length === 0}>
            Применить ({preview.length})
          </Button>
        </div>
      </div>
    </div>
  );
}

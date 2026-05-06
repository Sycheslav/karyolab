import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { SampleKaryotype } from "@/lib/types";
import { classNames } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Props {
  sampleIds: string[];
  karyotypes: SampleKaryotype[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function KaryotypeResultPicker({
  sampleIds,
  karyotypes,
  selectedIds,
  onToggle,
}: Props) {
  const available = karyotypes.filter((k) => sampleIds.includes(k.sampleId));

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="border-b border-brand-line p-3">
        <h3 className="text-[14px] font-bold text-brand-deep">
          Выбранные кариотипы
        </h3>
        <p className="mt-1 text-[11.5px] text-brand-muted">
          Выберите конкретный кариотип образца. У одного образца может быть
          несколько (по гибридизациям/метафазам).
        </p>
      </div>

      {sampleIds.length === 0 ? (
        <div className="p-4 text-center text-[12px] text-brand-muted">
          Сначала выберите образец слева вверху.
        </div>
      ) : available.length === 0 ? (
        <div className="p-4 text-center text-[12px] text-brand-muted">
          У выбранных образцов пока нет утверждённых кариотипов.
        </div>
      ) : (
        <ul>
          {available.map((k) => {
            const checked = selectedIds.includes(k.id);
            return (
              <li
                key={k.id}
                onClick={() => onToggle(k.id)}
                className={classNames(
                  "flex cursor-pointer items-start gap-3 border-t border-brand-line/60 p-3 transition",
                  checked ? "bg-brand-cream" : "hover:bg-brand-mint/40"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(k.id)}
                  className="mt-0.5 h-4 w-4 accent-brand"
                />
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-brand-deep">
                    {k.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone={k.status === "exported" ? "green" : k.status === "approved" ? "mint" : "amber"}>
                      {statusLabel(k.status)}
                    </Badge>
                    {k.main && <Badge tone="dark">основной</Badge>}
                    {k.isReference && <Badge tone="mint">эталон</Badge>}
                    <span className="text-[11px] text-brand-muted">
                      {k.selectedChromosomeIds.length} хромосом
                    </span>
                  </div>
                </div>
                {checked && (
                  <CheckCircle2 size={16} className="text-brand" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function statusLabel(s: SampleKaryotype["status"]) {
  switch (s) {
    case "draft":
      return "черновик";
    case "incomplete":
      return "неполный";
    case "ready_for_review":
      return "на проверку";
    case "approved":
      return "утверждён";
    case "exported":
      return "экспортирован";
    case "archived":
      return "архив";
  }
}

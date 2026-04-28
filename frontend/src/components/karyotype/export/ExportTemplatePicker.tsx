import Card from "@/components/ui/Card";
import type { ExportTemplate } from "@/lib/types";
import { classNames } from "@/lib/utils";
import { LayoutGrid, Layers3, Table, BarChart3 } from "lucide-react";

interface Props {
  templates: ExportTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const ICON: Record<ExportTemplate["type"], React.ReactNode> = {
  standard: <LayoutGrid size={18} />,
  multi_select: <Layers3 size={18} />,
  free_table: <Table size={18} />,
  summary_table: <BarChart3 size={18} />,
};

export default function ExportTemplatePicker({
  templates,
  selectedId,
  onSelect,
}: Props) {
  return (
    <Card>
      <h3 className="text-[14px] font-bold text-brand-deep">Шаблон</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {templates.map((t) => {
          const active = t.id === selectedId;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={classNames(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                active
                  ? "border-brand bg-brand-cream"
                  : "border-brand-line bg-white hover:bg-brand-mint/40"
              )}
            >
              <span
                className={classNames(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                  active ? "bg-brand text-white" : "bg-brand-mint text-brand-dark"
                )}
              >
                {ICON[t.type]}
              </span>
              <div>
                <div className="text-[13px] font-bold text-brand-deep">
                  {t.title}
                </div>
                <div className="mt-0.5 text-[11.5px] text-brand-muted">
                  {t.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

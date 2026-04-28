import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { CheckCircle2, FolderOpen, RefreshCw, SaveAll } from "lucide-react";
import toast from "react-hot-toast";
import type { ExportJob, ExportTemplateType } from "@/lib/types";

interface Props {
  job: ExportJob;
  templateType?: ExportTemplateType;
}

export default function ExportResultPanel({ job, templateType }: Props) {
  return (
    <Card accent>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white">
          <CheckCircle2 size={18} />
        </span>
        <div className="flex-1">
          <div className="text-[14px] font-bold text-brand-deep">
            Экспорт готов
          </div>
          <div className="text-[12px] text-brand-muted">
            <span className="font-mono font-semibold text-brand-deep">
              {job.fileName}
            </span>
            {" · "}
            {tplLabel(templateType ?? job.templateType)}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success("Открыл папку (mock)")}
        >
          <FolderOpen size={13} />
          Открыть в папке
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success("Сохранено как (mock)")}
        >
          <SaveAll size={13} />
          Сохранить как…
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast("Можно повторить с другим шаблоном", { icon: "↻" })}
        >
          <RefreshCw size={13} />
          Повторить с другим шаблоном
        </Button>
      </div>
    </Card>
  );
}

function tplLabel(t: ExportTemplateType) {
  switch (t) {
    case "standard":
      return "стандартный обзор";
    case "multi_select":
      return "мультивыбор";
    case "free_table":
      return "свободная таблица";
    case "summary_table":
      return "сводная таблица";
  }
}

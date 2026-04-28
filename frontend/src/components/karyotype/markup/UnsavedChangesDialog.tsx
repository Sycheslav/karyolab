import Button from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface Props {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function UnsavedChangesDialog({
  onSave,
  onDiscard,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle size={20} />
          </span>
          <div className="flex-1">
            <h3 className="text-[16px] font-bold text-brand-deep">
              Несохранённые изменения
            </h3>
            <p className="mt-1 text-[13px] text-brand-muted">
              На текущей хромосоме есть правки идеограммы, которых ещё нет на
              диске. Сохранить их перед переключением?
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Остаться
          </Button>
          <Button variant="outline" onClick={onDiscard}>
            Отбросить правки
          </Button>
          <Button variant="primary" onClick={onSave}>
            Сохранить и перейти
          </Button>
        </div>
      </div>
    </div>
  );
}

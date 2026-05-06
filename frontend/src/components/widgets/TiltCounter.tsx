import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { selectTiltCount, useStore } from "@/lib/store";

export default function TiltCounter() {
  const today = useStore((s) => selectTiltCount(s, "today"));
  const month = useStore((s) => selectTiltCount(s, "month"));
  const year = useStore((s) => selectTiltCount(s, "year"));
  const lastYear = useStore((s) => selectTiltCount(s, "lastYear"));
  const inc = useStore((s) => s.incrementTilt);

  // Соотношение «тильт / результат» (`08_заметки_и_тильт.md`):
  // тильт за текущий год к числу образцов, у которых результат
  // появился в этом году. Пока считаем по всем sample.hasResult.
  const resultsThisYear = useStore((s) => {
    const y = new Date().getFullYear();
    return s.samples.filter(
      (sm) =>
        (sm.status === "result" || sm.hasResult) &&
        new Date(sm.createdAt).getFullYear() <= y
    ).length;
  });
  const ratio =
    resultsThisYear > 0 ? (year / resultsThisYear).toFixed(1) : "—";

  return (
    <div className="rounded-2xl border border-brand-deep bg-brand-deep p-5 text-brand-cream shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13px] font-semibold tracking-wide text-brand-cream/80">
            Счётчик тильта
          </div>
          <div className="mt-0.5 text-[11px] text-brand-cream/60">
            Полушуточный индикатор нагрузки
          </div>
        </div>
        <button
          onClick={() => {
            inc();
            toast.success("Тильт +1");
          }}
          className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white shadow-soft transition hover:bg-brand/90 active:translate-y-px"
          aria-label="Добавить тильт"
          title="+1 тильт за сегодня"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-[44px] font-extrabold tracking-tight text-white">
          {String(today).padStart(2, "0")}
        </span>
        <span className="text-[12.5px] text-brand-cream/70">
          за сегодня
        </span>
      </div>

      <div className="mt-4 space-y-2 text-[12.5px]">
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <span className="text-brand-cream/70">За месяц</span>
          <span className="font-bold text-white">{month}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <span className="text-brand-cream/70">В этом году</span>
          <span className="font-bold text-white">{year}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <span className="text-brand-cream/70">В прошлом году</span>
          <span className="font-bold text-white">{lastYear}</span>
        </div>
        <div
          className="flex items-center justify-between border-t border-white/10 pt-2"
          title="Тильт за год / результаты за год"
        >
          <span className="text-brand-cream/70">Тильт / результат</span>
          <span className="font-bold text-white">{ratio}</span>
        </div>
      </div>
    </div>
  );
}

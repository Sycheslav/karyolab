import { classNames } from "@/lib/utils";

interface Props {
  status?: "active" | "completed" | "scheduled" | "draft";
  label?: string;
  className?: string;
}

const map = {
  active: { c: "bg-brand-accent/20 text-brand-dark border-brand-accent/40", l: "Активен" },
  completed: { c: "bg-brand-cream text-brand-dark border-brand-line", l: "Завершён" },
  scheduled: { c: "bg-amber-50 text-amber-700 border-amber-200", l: "Запланирован" },
  draft: { c: "bg-white text-brand-muted border-brand-line", l: "Черновик" },
} as const;

export default function StatusPill({ status = "active", label, className }: Props) {
  const m = map[status];
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold",
        m.c,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? m.l}
    </span>
  );
}

import { classNames } from "@/lib/utils";

interface TabOption {
  id: string;
  label: string;
}

interface TabsProps {
  value: string;
  onChange: (id: string) => void;
  options: TabOption[];
  className?: string;
}

export default function Tabs({ value, onChange, options, className }: TabsProps) {
  return (
    <div
      className={classNames(
        "inline-flex items-center gap-1 rounded-full border border-brand-line bg-white p-1",
        className
      )}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={classNames(
              "rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition",
              active
                ? "bg-brand-cream text-brand-deep"
                : "text-brand-muted hover:text-brand-deep"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

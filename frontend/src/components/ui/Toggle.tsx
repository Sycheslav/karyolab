import { classNames } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
  options: Option[];
  variant?: "default" | "danger";
  className?: string;
}

export default function Toggle({
  value,
  onChange,
  options,
  variant = "default",
  className,
}: Props) {
  return (
    <div
      className={classNames(
        "inline-flex rounded-lg border border-brand-line bg-white p-0.5",
        className
      )}
    >
      {options.map((o) => {
        const active = o.id === value;
        const isDanger = variant === "danger" && o.id === "discarded";
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={classNames(
              "rounded-md px-3 py-1 text-[12px] font-semibold transition",
              active
                ? isDanger
                  ? "bg-brand-danger text-white"
                  : "bg-brand-cream text-brand-deep"
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

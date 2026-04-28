import { ReactNode } from "react";
import { X } from "lucide-react";
import { classNames } from "@/lib/utils";

interface TagProps {
  children: ReactNode;
  onRemove?: () => void;
  tone?: "default" | "red" | "green" | "blue";
  className?: string;
}

const tones = {
  default: "bg-brand-accent/25 text-brand-dark border-brand-accent/40",
  red: "bg-brand-danger/15 text-brand-danger border-brand-danger/30",
  green: "bg-brand-accent/30 text-brand-dark border-brand-accent/50",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
} as const;

export default function Tag({
  children,
  onRemove,
  tone = "default",
  className,
}: TagProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium",
        tones[tone],
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-0.5 transition hover:bg-white/40"
          aria-label="Удалить"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

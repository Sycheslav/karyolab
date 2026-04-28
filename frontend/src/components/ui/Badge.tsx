import { ReactNode } from "react";
import { classNames } from "@/lib/utils";

type Tone =
  | "default"
  | "mint"
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "dark"
  | "ghost";

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

const tones: Record<Tone, string> = {
  default: "bg-brand-cream text-brand-dark border-brand-line",
  mint: "bg-brand-accent/25 text-brand-dark border-brand-accent/30",
  green: "bg-brand text-white border-brand-dark/30",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  red: "bg-brand-danger/15 text-brand-danger border-brand-danger/25",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  dark: "bg-brand-deep text-brand-cream border-brand-deep/50",
  ghost: "bg-white text-brand-deep border-brand-line",
};

export default function Badge({ tone = "default", children, className }: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

import { HTMLAttributes, ReactNode } from "react";
import { classNames } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  pad?: boolean;
  dark?: boolean;
  accent?: boolean;
  hover?: boolean;
  children?: ReactNode;
}

export default function Card({
  pad = true,
  dark,
  accent,
  hover,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={classNames(
        "rounded-2xl border shadow-card transition",
        dark
          ? "border-brand-deep/40 bg-brand-deep text-brand-cream"
          : accent
            ? "border-brand-line bg-brand-cream"
            : "border-brand-line bg-white",
        pad && "p-5",
        hover && "hover:shadow-soft hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

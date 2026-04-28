import { ReactNode } from "react";
import { classNames } from "@/lib/utils";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: Props) {
  return (
    <div
      className={classNames(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-line bg-brand-mint/40 px-6 py-10 text-center",
        className
      )}
    >
      {icon && <div className="mb-3 text-brand-muted">{icon}</div>}
      <div className="text-sm font-semibold text-brand-deep">{title}</div>
      {description && (
        <div className="mt-1 max-w-sm text-[12.5px] text-brand-muted">
          {description}
        </div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

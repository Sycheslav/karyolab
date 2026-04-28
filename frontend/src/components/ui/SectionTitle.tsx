import { ReactNode } from "react";
import { classNames } from "@/lib/utils";

interface Props {
  icon?: ReactNode;
  title: string;
  hint?: string;
  right?: ReactNode;
  className?: string;
}

export default function SectionTitle({
  icon,
  title,
  hint,
  right,
  className,
}: Props) {
  return (
    <div className={classNames("flex items-center gap-3", className)}>
      <div className="flex flex-1 items-center gap-2">
        {icon && <span className="text-brand-dark">{icon}</span>}
        <div>
          <h3 className="text-[15px] font-bold text-brand-deep">{title}</h3>
          {hint && <p className="text-[12px] text-brand-muted">{hint}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

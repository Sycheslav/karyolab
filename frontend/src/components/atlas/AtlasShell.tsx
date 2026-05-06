import type { ReactNode } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import AtlasContextBar from "./AtlasContextBar";

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbsExtra?: { label: string; to?: string }[];
  rightHeader?: ReactNode;
  children: ReactNode;
  hideContextBar?: boolean;
}

export default function AtlasShell({
  title,
  subtitle,
  breadcrumbsExtra = [],
  rightHeader,
  children,
  hideContextBar,
}: Props) {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Атлас" }, ...breadcrumbsExtra]} />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-page">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>
          )}
        </div>
        {rightHeader && <div className="flex items-center gap-2">{rightHeader}</div>}
      </header>
      {!hideContextBar && <AtlasContextBar />}
      {children}
    </div>
  );
}

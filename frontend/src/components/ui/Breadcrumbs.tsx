import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

interface Crumb {
  label: string;
  to?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="mb-3 flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-brand-muted">
      {items.map((c, i) => (
        <Fragment key={i}>
          {c.to ? (
            <Link to={c.to} className="font-semibold text-brand-dark hover:underline">
              {c.label}
            </Link>
          ) : (
            <span className="font-semibold text-brand-deep">{c.label}</span>
          )}
          {i < items.length - 1 && (
            <ChevronRight size={12} className="text-brand-muted/70" />
          )}
        </Fragment>
      ))}
    </nav>
  );
}

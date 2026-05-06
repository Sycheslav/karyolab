import { Star } from "lucide-react";

export default function ReferenceBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/40 bg-brand-accent/15 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-brand-dark">
      <Star size={10} /> Эталон
    </span>
  );
}

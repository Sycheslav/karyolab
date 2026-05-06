import { BookMarked } from "lucide-react";

export default function TheoreticalBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-line bg-brand-mint px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-brand-deep">
      <BookMarked size={10} /> Теория
    </span>
  );
}

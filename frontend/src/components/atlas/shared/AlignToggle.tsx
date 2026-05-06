import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";

export default function AlignToggle({ className }: { className?: string }) {
  const ctx = useStore((s) => s.atlasCtx);
  const setAtlasContext = useStore((s) => s.setAtlasContext);
  return (
    <button
      type="button"
      onClick={() => setAtlasContext({ alignByCentromere: !ctx.alignByCentromere })}
      className={classNames(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition",
        ctx.alignByCentromere
          ? "border-brand bg-brand-cream text-brand-deep"
          : "border-brand-line bg-white text-brand-muted hover:bg-brand-mint",
        className
      )}
    >
      <input
        type="checkbox"
        readOnly
        checked={ctx.alignByCentromere}
        className="h-3 w-3 accent-brand"
      />
      Выровнять по центромере
    </button>
  );
}

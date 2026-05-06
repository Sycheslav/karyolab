import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";

export default function AtlasSpeciesQuickFilter() {
  const species = useStore((s) => s.species);
  const ctx = useStore((s) => s.atlasCtx);
  const setAtlasFilters = useStore((s) => s.setAtlasFilters);

  const toggle = (id: string) => {
    const list = ctx.filters.speciesIds.includes(id)
      ? ctx.filters.speciesIds.filter((x) => x !== id)
      : [...ctx.filters.speciesIds, id];
    setAtlasFilters({ speciesIds: list });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {species.map((sp) => {
        const active = ctx.filters.speciesIds.includes(sp.id);
        return (
          <button
            key={sp.id}
            type="button"
            onClick={() => toggle(sp.id)}
            className={classNames(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition",
              active
                ? "border-brand-deep bg-brand-deep text-brand-cream"
                : "border-brand-line bg-white text-brand-muted hover:bg-brand-mint/40"
            )}
          >
            {sp.name}
          </button>
        );
      })}
    </div>
  );
}

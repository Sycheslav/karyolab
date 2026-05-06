import Toggle from "@/components/ui/Toggle";
import { useStore } from "@/lib/store";
import type { AtlasViewMode } from "@/lib/types";

export default function ViewModeSwitch({ className }: { className?: string }) {
  const ctx = useStore((s) => s.atlasCtx);
  const setAtlasContext = useStore((s) => s.setAtlasContext);
  return (
    <Toggle
      className={className}
      value={ctx.viewMode}
      onChange={(id) => setAtlasContext({ viewMode: id as AtlasViewMode })}
      options={[
        { id: "chromosomes", label: "Хр." },
        { id: "chromosomes_with_ideograms", label: "Хр. + Идг." },
        { id: "ideograms_only", label: "Идг." },
      ]}
    />
  );
}

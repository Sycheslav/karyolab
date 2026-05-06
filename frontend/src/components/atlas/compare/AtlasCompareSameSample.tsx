import { useMemo, useState } from "react";
import { Library } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Tabs from "@/components/ui/Tabs";
import ChromosomeGlyph from "@/components/karyotype/ChromosomeGlyph";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";

export default function AtlasCompareSameSample() {
  const samples = useStore((s) => s.samples);
  const preparations = useStore((s) => s.preparations);
  const stained = useStore((s) => s.stained);
  const chromosomes = useStore((s) => s.chromosomes);
  const ctx = useStore((s) => s.atlasCtx);

  const [mode, setMode] = useState<"prep" | "probe">("prep");
  const [sampleId, setSampleId] = useState<string>(
    () => samples.find((s) => s.hasResult)?.id ?? samples[0]?.id ?? ""
  );

  const cols = useMemo(() => {
    if (mode === "prep") {
      return preparations
        .filter((p) => p.sampleId === sampleId)
        .map((p) => ({ id: p.id, label: p.id }));
    }
    const sampleStained = stained.filter((s) =>
      preparations.some(
        (p) => p.id === s.preparationId && p.sampleId === sampleId
      )
    );
    return sampleStained.map((s) => ({
      id: s.id,
      label: s.probes.map((p) => p.name).join(" + "),
    }));
  }, [mode, sampleId, preparations, stained]);

  const classes = Array.from({ length: 7 }, (_, i) => i + 1);
  const subgenomes = ["A", "B", "D"];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr]">
      <Card className="space-y-3">
        <Select
          label="Образец"
          value={sampleId}
          onChange={(e) => setSampleId(e.target.value)}
        >
          {samples.map((s) => (
            <option key={s.id} value={s.id}>
              S-{s.id}
            </option>
          ))}
        </Select>
        <div>
          <div className="label-cap mb-1.5">Сравнение</div>
          <Tabs
            value={mode}
            onChange={(id) => setMode(id as "prep" | "probe")}
            options={[
              { id: "prep", label: "По препаратам" },
              { id: "probe", label: "По зондам" },
            ]}
          />
        </div>
      </Card>

      <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
        {cols.length === 0 ? (
          <EmptyState
            icon={<Library size={28} />}
            title="Нет вариантов"
            description="У этого образца нет препаратов/окрасок."
            className="bg-slate-900/60 border-slate-700 text-slate-300"
          />
        ) : (
          <div className="overflow-x-auto">
            <div
              className="grid items-stretch gap-2"
              style={{
                gridTemplateColumns: `40px repeat(${cols.length}, minmax(120px, 1fr))`,
              }}
            >
              <div />
              {cols.map((col) => (
                <div
                  key={col.id}
                  className="flex flex-col items-center justify-center rounded-md bg-slate-900 py-2 text-center text-slate-100"
                >
                  <span className="text-[10px] text-slate-400 truncate">
                    {col.id}
                  </span>
                  <span className="text-[12px] font-bold">{col.label}</span>
                </div>
              ))}

              {classes.flatMap((cls) => [
                <div
                  key={`lab-${cls}`}
                  className="flex items-center justify-center text-[12px] font-bold text-slate-400"
                >
                  {cls}
                </div>,
                ...cols.map((col) => {
                  const items = chromosomes.filter((c) => {
                    if (c.sampleId !== sampleId) return false;
                    if (c.chromosomeClass !== cls) return false;
                    if (mode === "prep") {
                      return c.metaphaseId.startsWith(col.id);
                    }
                    return c.stainedId === col.id;
                  });
                  return (
                    <div
                      key={`cell-${col.id}-${cls}`}
                      className={classNames(
                        "flex min-h-[70px] items-end justify-center gap-0.5 rounded border bg-slate-900 p-1",
                        items.length === 0
                          ? "border-dashed border-slate-700"
                          : "border-slate-700"
                      )}
                    >
                      {items.slice(0, 3).map((c) => (
                        <ChromosomeGlyph
                          key={c.id}
                          chromosome={c}
                          height={ctx.viewMode === "ideograms_only" ? 36 : 48}
                          ideogramOnly={ctx.viewMode === "ideograms_only"}
                          dark
                        />
                      ))}
                    </div>
                  );
                }),
              ])}
              <div className="col-span-full mt-2 text-[11px] text-slate-400">
                Субгеномы (рядом): {subgenomes.join(", ")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

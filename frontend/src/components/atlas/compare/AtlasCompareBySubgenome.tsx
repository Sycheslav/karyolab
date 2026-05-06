import { useMemo, useState } from "react";
import { Library } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import ChromosomeGlyph from "@/components/karyotype/ChromosomeGlyph";
import AtlasSamplePicker from "@/components/atlas/pickers/AtlasSamplePicker";
import AtlasReferencePicker from "@/components/atlas/pickers/AtlasReferencePicker";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";

const SUBGENOMES = ["A", "B", "D", "R", "U", "M", "S"];

export default function AtlasCompareBySubgenome() {
  const ctx = useStore((s) => s.atlasCtx);
  const chromosomes = useStore((s) => s.chromosomes);
  const sampleKaryotypes = useStore((s) => s.sampleKaryotypes);
  const samples = useStore((s) => s.samples);
  const [sub, setSub] = useState<string>("A");

  const refSampleIds = useMemo(
    () =>
      sampleKaryotypes
        .filter((k) => ctx.selectedReferenceIds.includes(k.id))
        .map((k) => k.sampleId),
    [sampleKaryotypes, ctx.selectedReferenceIds]
  );
  const allSampleIds = useMemo(
    () => Array.from(new Set([...ctx.selectedSampleIds, ...refSampleIds])),
    [ctx.selectedSampleIds, refSampleIds]
  );
  const classes = Array.from({ length: 7 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr]">
      <div className="space-y-3">
        <Card>
          <Select
            label="Субгеном"
            value={sub}
            onChange={(e) => setSub(e.target.value)}
          >
            {SUBGENOMES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Card>
        <AtlasSamplePicker />
        <AtlasReferencePicker />
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
        {allSampleIds.length === 0 ? (
          <EmptyState
            icon={<Library size={28} />}
            title="Выберите образцы"
            description={`Под выбранным субгеномом ${sub} построится сетка по классам.`}
            className="bg-slate-900/60 border-slate-700 text-slate-300"
          />
        ) : (
          <div className="overflow-x-auto">
            <div
              className="grid items-stretch gap-2"
              style={{
                gridTemplateColumns: `40px repeat(${allSampleIds.length}, minmax(120px, 1fr))`,
              }}
            >
              <div />
              {allSampleIds.map((sid) => {
                const sample = samples.find((s) => s.id === sid);
                return (
                  <div
                    key={`hd-${sid}`}
                    className="flex items-center justify-center rounded-md bg-slate-900 py-2 text-center text-slate-100"
                  >
                    <span className="text-[12px] font-extrabold">
                      S-{sample?.id ?? sid}
                    </span>
                  </div>
                );
              })}
              {classes.flatMap((cls) => [
                <div
                  key={`lab-${cls}`}
                  className="flex items-center justify-center text-[12px] font-bold text-slate-400"
                >
                  {sub}{cls}
                </div>,
                ...allSampleIds.map((sid) => {
                  const items = chromosomes.filter(
                    (c) =>
                      c.sampleId === sid &&
                      c.subgenome === sub &&
                      c.chromosomeClass === cls
                  );
                  return (
                    <div
                      key={`cell-${sid}-${cls}`}
                      className={classNames(
                        "flex min-h-[80px] items-end justify-center rounded border bg-slate-900 p-1",
                        items.length === 0
                          ? "border-dashed border-slate-700"
                          : "border-slate-700"
                      )}
                    >
                      {items.slice(0, 3).map((c) => (
                        <ChromosomeGlyph
                          key={c.id}
                          chromosome={c}
                          height={ctx.viewMode === "ideograms_only" ? 40 : 56}
                          ideogramOnly={ctx.viewMode === "ideograms_only"}
                          dark
                        />
                      ))}
                    </div>
                  );
                }),
              ])}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

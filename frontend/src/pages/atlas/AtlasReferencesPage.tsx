import { useMemo, useState } from "react";
import { Plus, Search, Star } from "lucide-react";
import AtlasShell from "@/components/atlas/AtlasShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import EmptyState from "@/components/ui/EmptyState";
import AtlasReferenceCard from "@/components/atlas/references/AtlasReferenceCard";
import AtlasMarkReferenceDialog from "@/components/atlas/references/AtlasMarkReferenceDialog";
import AtlasSpeciesQuickFilter from "@/components/atlas/pickers/AtlasSpeciesQuickFilter";
import { selectReferenceKaryotypes, useStore } from "@/lib/store";

export default function AtlasReferencesPage() {
  const refs = useStore(selectReferenceKaryotypes);
  const samples = useStore((s) => s.samples);
  const species = useStore((s) => s.species);
  const speciesIds = useStore((s) => s.atlasCtx.filters.speciesIds);

  const [search, setSearch] = useState("");
  const [source, setSource] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return refs.filter((k) => {
      if (source !== "all" && k.referenceSource !== source) return false;
      if (speciesIds.length > 0) {
        const sample = samples.find((s) => s.id === k.sampleId);
        if (!sample) return false;
        const matched = speciesIds.some((id) => {
          const sp = species.find((x) => x.id === id);
          return sp && (sample.species === sp.latinName || sample.species === sp.name);
        });
        if (!matched) return false;
      }
      if (q) {
        const hay = `${k.referenceLabel ?? ""} ${k.title} ${k.sampleId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [refs, search, source, speciesIds, samples, species]);

  return (
    <AtlasShell
      title="Атлас · Эталоны"
      subtitle="Избранные кариотипы образцов, помеченные эталонными. Используйте их в сравнениях и матрице."
      breadcrumbsExtra={[{ label: "Эталоны" }]}
      hideContextBar
      rightHeader={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={14} /> Пометить кариотип
        </Button>
      }
    >
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="flex-1 min-w-[240px]">
            <div className="label-cap mb-1.5">Вид</div>
            <AtlasSpeciesQuickFilter />
          </div>
          <Select
            label="Источник"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="lg:w-[180px]"
          >
            <option value="all">все</option>
            <option value="lab">lab</option>
            <option value="literature">literature</option>
            <option value="external">external</option>
          </Select>
          <Input
            label="Поиск"
            leading={<Search size={14} />}
            placeholder="имя эталона…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lg:w-[260px]"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Star size={28} />}
          title="Эталонов пока нет"
          description="Пометьте утверждённый кариотип эталоном — и он появится здесь."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus size={13} /> Пометить кариотип
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((k) => (
            <AtlasReferenceCard key={k.id} k={k} />
          ))}
        </div>
      )}

      {dialogOpen && (
        <AtlasMarkReferenceDialog onClose={() => setDialogOpen(false)} />
      )}
    </AtlasShell>
  );
}

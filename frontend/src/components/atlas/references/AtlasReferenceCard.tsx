import { useNavigate } from "react-router-dom";
import { GitCompare, LayoutGrid, StarOff } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import type { SampleKaryotype } from "@/lib/types";
import ReferenceBadge from "../shared/ReferenceBadge";
import AtlasMiniKaryotype from "../shared/AtlasMiniKaryotype";

interface Props {
  k: SampleKaryotype;
}

const STATUS_LABEL: Record<SampleKaryotype["status"], string> = {
  draft: "черновик",
  incomplete: "неполный",
  ready_for_review: "на проверку",
  approved: "утверждён",
  exported: "экспортирован",
  archived: "архив",
};

const STATUS_TONE: Record<
  SampleKaryotype["status"],
  "default" | "mint" | "green" | "amber" | "red" | "blue" | "dark" | "ghost"
> = {
  draft: "amber",
  incomplete: "amber",
  ready_for_review: "blue",
  approved: "mint",
  exported: "green",
  archived: "default",
};

export default function AtlasReferenceCard({ k }: Props) {
  const nav = useNavigate();
  const samples = useStore((s) => s.samples);
  const chromosomes = useStore((s) => s.chromosomes);
  const toggleRef = useStore((s) => s.toggleSampleKaryotypeReference);

  const sample = samples.find((s) => s.id === k.sampleId);
  const chroms = chromosomes
    .filter((c) => c.sampleId === k.sampleId)
    .slice(0, 7);

  return (
    <Card hover className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <ReferenceBadge />
          <h3 className="mt-1.5 text-[16px] font-extrabold text-brand-deep truncate">
            {k.referenceLabel ?? k.title}
          </h3>
          <p className="text-[12px] text-brand-muted truncate">
            S-{k.sampleId}
            {sample && ` · ${sample.species}`}
          </p>
        </div>
        <Badge tone={STATUS_TONE[k.status]}>{STATUS_LABEL[k.status]}</Badge>
      </div>

      <AtlasMiniKaryotype chromosomes={chroms} />

      <dl className="grid grid-cols-2 gap-2 text-[12px]">
        <div>
          <dt className="label-cap">Источник</dt>
          <dd className="font-semibold text-brand-deep">
            {k.referenceSource ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="label-cap">Область</dt>
          <dd className="font-semibold text-brand-deep">
            {k.referenceScope ?? "—"}
          </dd>
        </div>
      </dl>

      {k.referenceNotes && (
        <p className="rounded-lg bg-brand-mint/40 p-2 text-[11.5px] text-brand-deep">
          {k.referenceNotes}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() =>
            nav(`/атлас/сравнение?karyotypeId=${k.id}&scenario=vs_reference`)
          }
        >
          <GitCompare size={13} /> Сравнить с образцом
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => nav(`/атлас/матрица?karyotypeId=${k.id}`)}
        >
          <LayoutGrid size={13} /> Открыть в матрице
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            toggleRef(k.id);
            toast("Метка эталона снята");
          }}
        >
          <StarOff size={13} /> Снять метку
        </Button>
      </div>
    </Card>
  );
}

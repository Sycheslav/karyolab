import Card from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { CheckCircle2, AlertCircle, Calendar, Microscope } from "lucide-react";
import { classNames } from "@/lib/utils";

interface Props {
  sampleId?: string;
  stainedId?: string;
  preparationId?: string;
}

export default function KaryotypeContextCard({
  sampleId,
  stainedId,
  preparationId,
}: Props) {
  const sample = useStore((s) =>
    sampleId ? s.samples.find((x) => x.id === sampleId) : undefined
  );
  const stained = useStore((s) =>
    stainedId ? s.stained.find((x) => x.id === stainedId) : undefined
  );
  const prep = useStore((s) =>
    preparationId
      ? s.preparations.find((p) => p.id === preparationId)
      : undefined
  );

  const ready = !!sample && !!stained;

  return (
    <Card accent>
      <div className="flex items-center gap-2">
        <Microscope size={16} className="text-brand-dark" />
        <h3 className="text-[14px] font-bold text-brand-deep">
          Активный выбор
        </h3>
        <div className="ml-auto">
          {ready ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent/30 px-2.5 py-1 text-[11px] font-bold text-brand-dark">
              <CheckCircle2 size={12} /> Готов к импорту
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
              <AlertCircle size={12} /> Не хватает контекста
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3 text-[12.5px]">
        <Row label="Образец" value={sample ? `S-${sample.id}` : "—"}>
          {sample?.species && (
            <span className="text-brand-muted"> · {sample.species}</span>
          )}
        </Row>
        <Row label="Препарат" value={prep?.id ?? "—"}>
          {prep?.fridge && (
            <span className="text-brand-muted">
              {" "}
              · {prep.fridge} / {prep.box}
            </span>
          )}
        </Row>
        <Row label="Окраска" value={stained?.id ?? "—"} />
        {stained && (
          <div>
            <div className="label-cap">Зонды</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {stained.probes.map((p, i) => (
                <span
                  key={i}
                  className={classNames(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-bold uppercase",
                    p.channel === "red"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : p.channel === "green"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                  )}
                >
                  <span
                    className={classNames(
                      "h-1.5 w-1.5 rounded-full",
                      p.channel === "red"
                        ? "bg-red-500"
                        : p.channel === "green"
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                    )}
                  />
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-1 text-[11.5px]">
          <DateBox
            label="Создан"
            value={prep?.createdAt ?? "—"}
          />
          <DateBox
            label="Гибридизация"
            value={stained?.hybridizationDate ?? "—"}
          />
          <DateBox label="Фотограф." value={prepPhotoDate(prep?.status)} />
        </div>
      </div>
    </Card>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="label-cap">{label}</span>
      <span className="font-semibold text-brand-deep">{value}</span>
      {children}
    </div>
  );
}

function DateBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-line bg-white px-2 py-1.5">
      <div className="text-[10px] font-bold uppercase text-brand-muted">
        {label}
      </div>
      <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-semibold text-brand-deep">
        <Calendar size={11} />
        {value}
      </div>
    </div>
  );
}

function prepPhotoDate(status?: string) {
  if (status === "photographed") return "сегодня";
  return "—";
}

import { useStore } from "@/lib/store";
import type { KaryotypeLevel } from "@/lib/types";
import { classNames } from "@/lib/utils";
import { Microscope, Dna, FileImage, MapPin } from "lucide-react";

interface Props {
  sampleId?: string;
  stainedId?: string;
  metaphaseId?: string;
  level?: KaryotypeLevel;
  /** Дополнительная подпись справа: например статус. */
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Узкая полоса контекста: образец, окрашенный препарат, уровень,
 * метафаза. Используется на всех страницах кариотипа.
 */
export default function KaryotypeContextBar({
  sampleId,
  stainedId,
  metaphaseId,
  level,
  rightSlot,
  className,
}: Props) {
  const sample = useStore((s) =>
    sampleId ? s.samples.find((x) => x.id === sampleId) : undefined
  );
  const stained = useStore((s) =>
    stainedId ? s.stained.find((x) => x.id === stainedId) : undefined
  );
  const prep = useStore((s) =>
    stained ? s.preparations.find((p) => p.id === stained.preparationId) : undefined
  );
  const metaphase = useStore((s) =>
    metaphaseId ? s.metaphases.find((m) => m.id === metaphaseId) : undefined
  );

  return (
    <div
      className={classNames(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-brand-line bg-white px-4 py-3 shadow-card",
        className
      )}
    >
      <Pill icon={<Dna size={13} />} label="Образец">
        {sample ? `S-${sample.id}` : "не выбран"}
      </Pill>
      {prep && (
        <Pill icon={<Microscope size={13} />} label="Препарат">
          {prep.id}
        </Pill>
      )}
      {stained && (
        <Pill icon={<FileImage size={13} />} label="Окраска">
          <span className="font-semibold">
            {stained.id}
          </span>
          <span className="ml-2 inline-flex flex-wrap gap-1">
            {stained.probes.map((p, i) => (
              <span
                key={i}
                className={classNames(
                  "rounded px-1.5 py-px text-[10px] font-bold",
                  p.channel === "red"
                    ? "bg-red-100 text-red-700"
                    : p.channel === "green"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                )}
              >
                {p.name}
              </span>
            ))}
          </span>
        </Pill>
      )}
      {metaphase && (
        <Pill icon={<MapPin size={13} />} label="Метафаза">
          {metaphase.id}
          {metaphase.coordinates && (
            <span className="text-brand-muted"> · {metaphase.coordinates}</span>
          )}
        </Pill>
      )}
      {level && (
        <Pill icon={null} label="Уровень">
          {level === "metaphase" ? "Метафаза" : "Гибридизация"}
        </Pill>
      )}

      {rightSlot && <div className="ml-auto">{rightSlot}</div>}
    </div>
  );
}

function Pill({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-brand-line bg-brand-mint/40 px-2.5 py-1.5">
      {icon && <span className="text-brand-dark">{icon}</span>}
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-brand-muted">
        {label}
      </span>
      <span className="text-[12.5px] font-semibold text-brand-deep">
        {children}
      </span>
    </div>
  );
}

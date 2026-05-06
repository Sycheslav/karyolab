import {
  Columns2,
  Grid3x3,
  Layers3,
  TestTube,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import type { AtlasCompareLayout } from "@/lib/types";
import { classNames } from "@/lib/utils";

const LAYOUTS = [
  {
    id: "two_side",
    title: "Два кариотипа рядом",
    description: "Слева Кариотип A, справа Кариотип B.",
    icon: Columns2,
  },
  {
    id: "multi",
    title: "Мультивыбор по шаблону",
    description: "Несколько образцов в одной общей матрице.",
    icon: Layers3,
  },
  {
    id: "by_subgenome",
    title: "По одному субгеному",
    description:
      "Столбцы — образцы, строки — классы фиксированного субгенома.",
    icon: Grid3x3,
  },
  {
    id: "by_preparation",
    title: "Один образец, разные препараты/зонды",
    description: "Технические варианты одного образца.",
    icon: TestTube,
  },
] as const;

export default function AtlasCompareLayoutSwitch() {
  const ctx = useStore((s) => s.atlasCtx);
  const setAtlasContext = useStore((s) => s.setAtlasContext);

  return (
    <Card>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {LAYOUTS.map((l) => {
          const Icon = l.icon;
          const active = ctx.compareLayout === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() =>
                setAtlasContext({ compareLayout: l.id as AtlasCompareLayout })
              }
              className={classNames(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                active
                  ? "border-brand bg-brand-cream"
                  : "border-brand-line bg-white hover:bg-brand-mint/40"
              )}
            >
              <span
                className={classNames(
                  "grid h-9 w-9 place-items-center rounded-lg",
                  active
                    ? "bg-brand text-white"
                    : "bg-brand-mint text-brand-dark"
                )}
              >
                <Icon size={16} />
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-brand-deep">
                  {l.title}
                </div>
                <div className="text-[11.5px] text-brand-muted">
                  {l.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

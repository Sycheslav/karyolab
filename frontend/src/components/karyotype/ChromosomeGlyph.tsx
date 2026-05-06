import { classNames } from "@/lib/utils";
import type {
  ChromosomeObject,
  Ideogram,
  IdeogramSignal,
} from "@/lib/types";

interface Props {
  chromosome: ChromosomeObject;
  ideogram?: Ideogram;
  /** Высота тела хромосомы в px. */
  height?: number;
  width?: number;
  /** Если true — рендерим как идеограмму (упрощённую палочку с цветными метками). */
  ideogramOnly?: boolean;
  className?: string;
  /** Отображать центромеру (perehvat). */
  showCentromere?: boolean;
  /** Подложка тёмная. */
  dark?: boolean;
}

/**
 * Стилизованное представление хромосомы для mock-UI.
 *
 * Рендерит:
 * - тело хромосомы (синяя капсула с лёгкой зернистостью);
 * - центромеру (перехват), если задана в идеограмме или подсказке;
 * - сигналы (точки/отрезки) поверх тела;
 * - аномалии как маленькие маркеры рядом.
 *
 * Координаты сигналов нормализованы 0..1 от вершины к низу.
 */
export default function ChromosomeGlyph({
  chromosome,
  ideogram,
  height,
  width,
  ideogramOnly,
  showCentromere = true,
  dark,
  className,
}: Props) {
  const h = height ?? Math.max(60, Math.min(220, chromosome.maskSizePx));
  const w = width ?? Math.max(14, Math.round(h * 0.18));

  // Центромера — приоритет идеограмме, иначе подсказке
  const centromere =
    ideogram?.centromere ?? chromosome.centromereHint ?? undefined;

  // Сигналы — из идеограммы; если её нет, генерируем mock из счётчиков
  const signals: IdeogramSignal[] =
    ideogram?.signals ??
    [
      ...Array.from({ length: chromosome.redSpots ?? 0 }).map<IdeogramSignal>(
        (_, i) => ({
          id: `mock-r-${i}`,
          channel: "red",
          kind: "point",
          position: 0.18 + i * 0.22,
          size: 2,
        })
      ),
      ...Array.from({ length: chromosome.greenSpots ?? 0 }).map<IdeogramSignal>(
        (_, i) => ({
          id: `mock-g-${i}`,
          channel: "green",
          kind: i === 0 ? "segment" : "point",
          position: 0.55 + i * 0.12,
          size: 2,
          length: i === 0 ? 0.06 : undefined,
        })
      ),
    ];

  // Цвет тела
  const bodyClass = ideogramOnly
    ? "bg-slate-300"
    : dark
      ? "bg-gradient-to-b from-slate-400 to-slate-700"
      : "bg-gradient-to-b from-slate-400 via-slate-500 to-slate-700";

  return (
    <div
      className={classNames("relative", className)}
      style={{ height: h, width: w * 2.2 }}
    >
      {/* тело */}
      <div
        className={classNames(
          "absolute left-1/2 -translate-x-1/2 rounded-[999px] shadow-inner",
          bodyClass
        )}
        style={{ width: w, height: h, top: 0 }}
      >
        {/* центромера: перехват */}
        {showCentromere && centromere !== undefined && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white/70"
            style={{
              top: `calc(${centromere * 100}% - 2px)`,
              width: w * 1.15,
              height: 4,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
            }}
          />
        )}
      </div>

      {/* сигналы — поверх тела */}
      {signals.map((s) => {
        const top = `${Math.max(0, Math.min(1, s.position)) * 100}%`;
        const sizePx = (s.size ?? 2) * 2 + 2; // 4..10
        const color =
          s.channel === "red"
            ? "bg-red-500"
            : s.channel === "green"
              ? "bg-emerald-400"
              : "bg-blue-400";
        if (s.kind === "segment") {
          const lenPx = Math.max(4, (s.length ?? 0.05) * h);
          return (
            <div
              key={s.id}
              className={classNames(
                "absolute left-1/2 -translate-x-1/2 rounded-sm opacity-90",
                color
              )}
              style={{
                top,
                width: w * 0.9,
                height: lenPx,
              }}
            />
          );
        }
        return (
          <div
            key={s.id}
            className={classNames(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-95",
              color
            )}
            style={{
              left: "50%",
              top,
              width: sizePx,
              height: sizePx,
              boxShadow: "0 0 4px rgba(0,0,0,0.4)",
            }}
          />
        );
      })}

      {/* аномалии — маленький жёлтый треугольник справа */}
      {ideogram?.anomalies?.map((a) => (
        <div
          key={a.id}
          className="absolute right-0 z-10 grid h-3 w-3 -translate-y-1/2 place-items-center rounded-sm bg-amber-400 text-[8px] font-black text-amber-900"
          style={{ top: `${a.position * 100}%` }}
          title={a.comment ?? a.type}
        >
          !
        </div>
      ))}
    </div>
  );
}

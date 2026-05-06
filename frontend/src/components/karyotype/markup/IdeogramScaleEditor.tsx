import { useRef, useState } from "react";
import Card from "@/components/ui/Card";
import { selectIdeogramFor, useStore } from "@/lib/store";
import type {
  AnomalyType,
  ChromosomeObject,
  IdeogramAnomaly,
  IdeogramSignal,
  SignalKind,
} from "@/lib/types";
import { classNames } from "@/lib/utils";
import { Trash2, Plus, AlertTriangle } from "lucide-react";

interface Props {
  chromosome: ChromosomeObject;
}

type Tool = "centromere" | "red" | "green" | "anomaly";

/**
 * Шкалы разметки идеограммы. Под каждой шкалой можно кликать,
 * чтобы добавить точку. Для зелёного канала поддерживается drag,
 * который создаёт segment.
 */
export default function IdeogramScaleEditor({ chromosome }: Props) {
  const ideogram = useStore((s) => selectIdeogramFor(s, chromosome.id));
  const setCentromere = useStore((s) => s.setIdeogramCentromere);
  const addSignal = useStore((s) => s.addIdeogramSignal);
  const removeSignal = useStore((s) => s.removeIdeogramSignal);
  const addAnomaly = useStore((s) => s.addIdeogramAnomaly);
  const removeAnomaly = useStore((s) => s.removeIdeogramAnomaly);
  // Источник правды по типам аномалий — справочник атласа.
  const anomalyTypes = useStore((s) => s.anomalyTypes);
  const chromAnomalyOptions = anomalyTypes.filter(
    (t) => t.defaultLevel === "chromosome" || t.defaultLevel === "metaphase"
  );

  const [tool, setTool] = useState<Tool>("centromere");
  const [signalKind, setSignalKind] = useState<SignalKind>("point");
  const [anomalyType, setAnomalyType] = useState<AnomalyType>(
    (chromAnomalyOptions[0]?.code ?? "translocation") as AnomalyType
  );
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);

  const lengthLabel = `${chromosome.maskSizePx} px`;

  const signals = ideogram?.signals ?? [];
  const anomalies = ideogram?.anomalies ?? [];

  const onScaleClick = (
    e: React.MouseEvent<HTMLDivElement>,
    scale: "centromere" | "red" | "green" | "anomaly"
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    if (scale === "centromere") {
      setCentromere(chromosome.id, pos);
      return;
    }
    if (scale === "red") {
      addSignal(chromosome.id, {
        channel: "red",
        kind: signalKind === "segment" ? "point" : signalKind,
        position: pos,
        size: signalSizeFromKind(signalKind),
      });
      return;
    }
    if (scale === "green") {
      addSignal(chromosome.id, {
        channel: "green",
        kind: signalKind,
        position: pos,
        size: signalSizeFromKind(signalKind),
        length: signalKind === "segment" ? 0.08 : undefined,
      });
      return;
    }
    if (scale === "anomaly") {
      addAnomaly(chromosome.id, {
        type: anomalyType,
        position: pos,
        comment: "",
      });
      return;
    }
  };

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-brand-line px-4 py-2">
        <h3 className="text-[14px] font-bold text-brand-deep">
          Шкалы разметки
        </h3>
        <span className="text-[11px] text-brand-muted">
          Длина из маски: {lengthLabel}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <ToolButton
            id="centromere"
            label="Центромера"
            color="bg-white text-brand-deep"
            active={tool}
            onClick={setTool}
          />
          <ToolButton
            id="red"
            label="Red +"
            color="bg-red-100 text-red-700"
            active={tool}
            onClick={setTool}
          />
          <ToolButton
            id="green"
            label="Green +"
            color="bg-emerald-100 text-emerald-700"
            active={tool}
            onClick={setTool}
          />
          <ToolButton
            id="anomaly"
            label="Аномалия"
            color="bg-amber-100 text-amber-800"
            active={tool}
            onClick={setTool}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-brand-line bg-brand-mint/30 px-4 py-1.5 text-[11px] text-brand-muted">
        <span className="font-semibold uppercase tracking-wider text-brand-deep/70">
          Тип сигнала
        </span>
        {(
          [
            ["small_point", "маленькая точка"],
            ["point", "точка"],
            ["large_point", "большая точка"],
            ["segment", "отрезок (зелёный)"],
          ] as [SignalKind, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSignalKind(id)}
            className={classNames(
              "rounded-full border px-2 py-0.5 text-[10.5px] font-bold transition",
              signalKind === id
                ? "border-brand bg-brand text-white"
                : "border-brand-line bg-white text-brand-deep hover:bg-brand-mint"
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-[10.5px]">
          для красного отрезок недоступен — фиксируется как «точка»
        </span>
      </div>

      <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-3 bg-slate-950 p-4 text-slate-200">
        <ScaleAxis lengthLabel={lengthLabel} />
        <Scale
          title="Центромера"
          accent="bg-white"
          onClick={(e) => onScaleClick(e, "centromere")}
          markers={
            ideogram?.centromere !== undefined
              ? [
                  {
                    id: "c",
                    position: ideogram.centromere,
                    color: "bg-white",
                    label: "C",
                  },
                ]
              : []
          }
        />
        <Scale
          title="Красный"
          accent="bg-red-500"
          onClick={(e) => onScaleClick(e, "red")}
          markers={signals
            .filter((s) => s.channel === "red")
            .map((s) => ({
              id: s.id,
              position: s.position,
              color: "bg-red-500",
              size: (s.size ?? 2) * 2 + 4,
              label: s.probeName?.[0],
              selected: s.id === selectedSignalId,
              onSelect: () =>
                setSelectedSignalId(selectedSignalId === s.id ? null : s.id),
            }))}
        />
        <DraggableScale
          title="Зелёный"
          accent="bg-emerald-400"
          onPoint={(pos) =>
            addSignal(chromosome.id, {
              channel: "green",
              kind: signalKind === "segment" ? "point" : signalKind,
              position: pos,
              size: signalSizeFromKind(signalKind),
            })
          }
          onSegment={(start, end) =>
            addSignal(chromosome.id, {
              channel: "green",
              kind: "segment",
              position: start,
              length: Math.max(0.02, end - start),
              size: 2,
            })
          }
          markers={signals
            .filter((s) => s.channel === "green")
            .map((s) => ({
              id: s.id,
              position: s.position,
              kind: s.kind,
              length: s.length,
              color: "bg-emerald-400",
              selected: s.id === selectedSignalId,
              onSelect: () =>
                setSelectedSignalId(selectedSignalId === s.id ? null : s.id),
            }))}
        />
        <Scale
          title="Аномалии"
          accent="bg-amber-400"
          onClick={(e) => onScaleClick(e, "anomaly")}
          markers={anomalies.map((a) => ({
            id: a.id,
            position: a.position,
            color: "bg-amber-400",
            label: "!",
          }))}
        />
      </div>

      {/* списки и инструменты */}
      <div className="grid grid-cols-1 gap-3 border-t border-brand-line p-3 md:grid-cols-2">
        <SignalsList
          title={`Сигналы (${signals.length})`}
          items={signals}
          onRemove={(id) => {
            removeSignal(chromosome.id, id);
            if (selectedSignalId === id) setSelectedSignalId(null);
          }}
        />
        <AnomaliesList
          items={anomalies}
          anomalyType={anomalyType}
          options={chromAnomalyOptions.map((t) => ({ id: t.code, label: t.label }))}
          onChangeType={setAnomalyType}
          onAddAt={(pos) =>
            addAnomaly(chromosome.id, {
              type: anomalyType,
              position: pos,
              comment: "",
            })
          }
          onRemove={(id) => removeAnomaly(chromosome.id, id)}
        />
      </div>
    </Card>
  );
}

function ToolButton({
  id,
  label,
  color,
  active,
  onClick,
}: {
  id: Tool;
  label: string;
  color: string;
  active: Tool;
  onClick: (id: Tool) => void;
}) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={classNames(
        "rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition",
        isActive
          ? "border-brand bg-brand text-white"
          : `border-brand-line ${color} hover:brightness-95`
      )}
    >
      {label}
    </button>
  );
}

function ScaleAxis({ lengthLabel }: { lengthLabel: string }) {
  return (
    <div className="flex flex-col items-end justify-between py-2 pr-2 text-[10px] uppercase tracking-wider text-slate-400">
      <span>0%</span>
      <span>{lengthLabel}</span>
      <span>100%</span>
    </div>
  );
}

interface ScaleMarker {
  id: string;
  position: number;
  color: string;
  size?: number;
  label?: string;
  selected?: boolean;
  onSelect?: () => void;
}

function Scale({
  title,
  accent,
  onClick,
  markers,
}: {
  title: string;
  accent: string;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  markers: ScaleMarker[];
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-300">
        {title}
      </div>
      <div
        onClick={onClick}
        className="relative h-[280px] w-3 cursor-crosshair rounded-full bg-slate-800 hover:bg-slate-700"
      >
        <div
          className={classNames(
            "absolute left-1/2 top-0 h-full w-px -translate-x-1/2 opacity-50",
            accent.replace("bg-", "bg-").includes("white") ? "bg-white/40" : accent
          )}
        />
        {markers.map((m) => (
          <button
            key={m.id}
            onClick={(e) => {
              e.stopPropagation();
              m.onSelect?.();
            }}
            className={classNames(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full",
              m.color,
              m.selected && "ring-2 ring-white"
            )}
            style={{
              left: "50%",
              top: `${m.position * 100}%`,
              width: m.size ?? 10,
              height: m.size ?? 10,
            }}
          >
            {m.label && (
              <span className="absolute -right-3 top-1/2 -translate-y-1/2 translate-x-full whitespace-nowrap text-[9px] font-bold text-slate-200">
                {m.label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface DragMarker {
  id: string;
  position: number;
  kind: SignalKind;
  length?: number;
  color: string;
  selected?: boolean;
  onSelect?: () => void;
}

function DraggableScale({
  title,
  accent,
  onPoint,
  onSegment,
  markers,
}: {
  title: string;
  accent: string;
  onPoint: (pos: number) => void;
  onSegment: (start: number, end: number) => void;
  markers: DragMarker[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);

  const posFromEvent = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-300">
        {title}
      </div>
      <div
        ref={ref}
        onMouseDown={(e) => setDragStart(posFromEvent(e))}
        onMouseMove={(e) => {
          if (dragStart !== null) setDragEnd(posFromEvent(e));
        }}
        onMouseUp={(e) => {
          const end = posFromEvent(e);
          if (dragStart !== null) {
            const delta = Math.abs(end - dragStart);
            if (delta < 0.02) onPoint(dragStart);
            else onSegment(Math.min(dragStart, end), Math.max(dragStart, end));
          }
          setDragStart(null);
          setDragEnd(null);
        }}
        onMouseLeave={() => {
          setDragStart(null);
          setDragEnd(null);
        }}
        className="relative h-[280px] w-3 cursor-crosshair rounded-full bg-slate-800 hover:bg-slate-700"
      >
        <div
          className={classNames(
            "absolute left-1/2 top-0 h-full w-px -translate-x-1/2 opacity-50",
            accent
          )}
        />
        {dragStart !== null && dragEnd !== null && (
          <div
            className={classNames(
              "absolute left-1/2 -translate-x-1/2 rounded-sm opacity-50",
              accent
            )}
            style={{
              top: `${Math.min(dragStart, dragEnd) * 100}%`,
              height: `${Math.abs(dragEnd - dragStart) * 100}%`,
              width: "100%",
            }}
          />
        )}
        {markers.map((m) =>
          m.kind === "segment" ? (
            <button
              key={m.id}
              onClick={(e) => {
                e.stopPropagation();
                m.onSelect?.();
              }}
              className={classNames(
                "absolute left-1/2 w-full -translate-x-1/2 rounded-sm",
                m.color,
                m.selected && "ring-2 ring-white"
              )}
              style={{
                top: `${m.position * 100}%`,
                height: `${(m.length ?? 0.05) * 100}%`,
              }}
            />
          ) : (
            <button
              key={m.id}
              onClick={(e) => {
                e.stopPropagation();
                m.onSelect?.();
              }}
              className={classNames(
                "absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full",
                m.color,
                m.selected && "ring-2 ring-white"
              )}
              style={{ left: "50%", top: `${m.position * 100}%` }}
            />
          )
        )}
      </div>
      <div className="text-[10px] text-slate-400">drag = отрезок · click = точка</div>
    </div>
  );
}

function SignalsList({
  title,
  items,
  onRemove,
}: {
  title: string;
  items: IdeogramSignal[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-brand-line bg-white">
      <div className="border-b border-brand-line px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
        {title}
      </div>
      <ul className="max-h-[180px] divide-y divide-brand-line/60 overflow-y-auto">
        {items.length === 0 && (
          <li className="px-3 py-3 text-[12px] text-brand-muted">
            Кликните на цветную шкалу слева, чтобы добавить.
          </li>
        )}
        {items.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-2 px-3 py-1.5 text-[12px]"
          >
            <span
              className={classNames(
                "h-2 w-2 rounded-full",
                s.channel === "red"
                  ? "bg-red-500"
                  : s.channel === "green"
                    ? "bg-emerald-500"
                    : "bg-blue-500"
              )}
            />
            <span className="font-semibold text-brand-deep">
              {s.channel === "red" ? "R" : s.channel === "green" ? "G" : "B"}
            </span>
            <span className="text-brand-muted">
              {s.kind === "segment"
                ? `отрезок · ${(s.length ?? 0).toFixed(2)}`
                : s.kind === "small_point"
                  ? "малая точка"
                  : s.kind === "large_point"
                    ? "большая точка"
                    : "точка"}
            </span>
            <span className="ml-auto font-mono text-[11px] text-brand-muted">
              {(s.position * 100).toFixed(0)}%
            </span>
            <button
              onClick={() => onRemove(s.id)}
              className="ml-1 grid h-6 w-6 place-items-center rounded-md text-brand-muted hover:bg-brand-cream hover:text-brand-danger"
              title="Удалить"
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnomaliesList({
  items,
  anomalyType,
  options,
  onChangeType,
  onAddAt,
  onRemove,
}: {
  items: IdeogramAnomaly[];
  anomalyType: AnomalyType;
  options: { id: AnomalyType; label: string }[];
  onChangeType: (t: AnomalyType) => void;
  onAddAt: (pos: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/40">
      <div className="flex items-center gap-2 border-b border-amber-200 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-amber-800">
        <AlertTriangle size={12} />
        Аномалии · {items.length}
        <select
          className="ml-auto rounded-md border border-amber-200 bg-white px-1 py-0.5 text-[11px] font-semibold text-amber-900"
          value={anomalyType}
          onChange={(e) => onChangeType(e.target.value as AnomalyType)}
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <a
          href="/атлас/аномалии"
          className="text-[10.5px] font-semibold text-amber-800 underline-offset-2 hover:underline"
          title="Открыть справочник аномалий"
        >
          справочник
        </a>
        <button
          onClick={() => onAddAt(0.5)}
          className="grid h-6 w-6 place-items-center rounded-md bg-amber-200 text-amber-900 hover:bg-amber-300"
          title="Добавить в середине"
        >
          <Plus size={12} />
        </button>
      </div>
      <ul className="max-h-[180px] divide-y divide-amber-100/60 overflow-y-auto">
        {items.length === 0 && (
          <li className="px-3 py-3 text-[12px] text-amber-800/70">
            Кликните по жёлтой шкале или нажмите «+».
          </li>
        )}
        {items.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-amber-900"
          >
            <span className="font-semibold">
              {options.find((o) => o.id === a.type)?.label ?? anomalyLabel(a.type)}
            </span>
            <span className="ml-auto font-mono text-[11px]">
              {(a.position * 100).toFixed(0)}%
            </span>
            <button
              onClick={() => onRemove(a.id)}
              className="grid h-6 w-6 place-items-center rounded-md text-amber-700 hover:bg-amber-100"
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function signalSizeFromKind(k: SignalKind): number {
  switch (k) {
    case "small_point":
      return 1;
    case "point":
      return 2;
    case "large_point":
      return 3;
    case "segment":
      return 2;
  }
}

function anomalyLabel(t: AnomalyType): string {
  const map: Record<AnomalyType, string> = {
    trisomy: "трисомия",
    aneuploidy: "анеуплоидия",
    monosomy: "моносомия",
    nullisomy: "нуллисомия",
    substitution: "замещение",
    translocation: "транслокация",
    atypical_block: "нетипичный блок",
    missing_signal: "отсутствие сигнала",
    foreign_material: "чужеродный материал",
    doubtful: "сомнение",
  };
  return map[t] ?? t;
}

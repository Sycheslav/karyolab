import Card from "@/components/ui/Card";
import type { ExportSettings, ExportFormat } from "@/lib/types";
import { classNames } from "@/lib/utils";

interface Props {
  settings: ExportSettings;
  onChange: (s: ExportSettings) => void;
  disableCentromere: boolean;
  isTable: boolean;
}

export default function ExportSettingsPanel({
  settings,
  onChange,
  disableCentromere,
  isTable,
}: Props) {
  const set = <K extends keyof ExportSettings>(k: K, v: ExportSettings[K]) =>
    onChange({ ...settings, [k]: v });

  return (
    <Card>
      <h3 className="text-[14px] font-bold text-brand-deep">Настройки</h3>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {!isTable && (
          <div>
            <div className="label-cap mb-1.5">Что показывать</div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["chromosomes", "хромосомы"],
                  ["chromosomes_with_ideograms", "хр. + идеограммы"],
                  ["ideograms_only", "только идеограммы"],
                ] as const
              ).map(([id, label]) => (
                <Pill
                  key={id}
                  active={settings.view === id}
                  onClick={() => set("view", id)}
                >
                  {label}
                </Pill>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="label-cap mb-1.5">Формат</div>
          <div className="flex gap-1.5">
            {(["png", "pdf"] as ExportFormat[]).map((f) => (
              <Pill
                key={f}
                active={settings.format === f}
                onClick={() => set("format", f)}
              >
                {f.toUpperCase()}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <div className="label-cap mb-1.5">Качество</div>
          <div className="flex gap-1.5">
            {(
              [
                ["draft", "рабочий"],
                ["publication", "публикационный"],
              ] as const
            ).map(([id, label]) => (
              <Pill
                key={id}
                active={settings.quality === id}
                onClick={() => set("quality", id)}
              >
                {label}
              </Pill>
            ))}
          </div>
        </div>

        {!isTable && (
          <div className="md:col-span-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Toggle
              label="Выровнять по центромере"
              checked={settings.alignByCentromere}
              disabled={disableCentromere}
              onChange={(v) => set("alignByCentromere", v)}
              hint={
                disableCentromere
                  ? "Не у всех хромосом задана центромера"
                  : undefined
              }
            />
            <Toggle
              label="Подписи зондов"
              checked={settings.showProbeLabels}
              onChange={(v) => set("showProbeLabels", v)}
            />
            <Toggle
              label="Подписи аномалий"
              checked={settings.showAnomalyLabels}
              onChange={(v) => set("showAnomalyLabels", v)}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "rounded-full border px-3 py-1.5 text-[12px] font-bold transition",
        active
          ? "border-brand bg-brand text-white"
          : "border-brand-line bg-white text-brand-deep hover:bg-brand-mint"
      )}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  checked,
  disabled,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label
      className={classNames(
        "flex items-start gap-3 rounded-xl border p-3 transition",
        disabled
          ? "border-brand-line bg-brand-mint/30 opacity-60"
          : "cursor-pointer border-brand-line bg-white hover:bg-brand-mint/40"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-brand"
      />
      <div>
        <div className="text-[12.5px] font-semibold text-brand-deep">
          {label}
        </div>
        {hint && (
          <div className="text-[10.5px] text-brand-muted">{hint}</div>
        )}
      </div>
    </label>
  );
}

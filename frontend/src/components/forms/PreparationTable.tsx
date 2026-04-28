import type { Preparation } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import { classNames, fmtDateShort } from "@/lib/utils";

interface Row {
  prep: Preparation;
  selected: boolean;
}

interface Props {
  rows: Row[];
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  showStorage?: boolean;
  storageOverrides?: Record<string, { fridge: string; box: string }>;
  onStorageChange?: (id: string, fridge: string, box: string) => void;
  search?: string;
  /** Подпись/функция показа источника материала (растение или смесь). */
  sourceLabel?: (prep: Preparation) => string;
}

export default function PreparationTable({
  rows,
  onToggle,
  onToggleAll,
  showStorage,
  storageOverrides = {},
  onStorageChange,
  search = "",
  sourceLabel,
}: Props) {
  const filtered = rows.filter((r) => {
    if (
      search &&
      !`${r.prep.id} ${r.prep.sampleId}`.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const allChecked = filtered.length > 0 && filtered.every((r) => r.selected);

  return (
    <div className="overflow-hidden rounded-xl border border-brand-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-brand-deep text-brand-cream">
            <th className="w-10 px-3 py-2.5 text-left">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => onToggleAll(e.target.checked)}
                className="accent-brand-accent"
                aria-label="Выбрать все"
              />
            </th>
            <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
              ID препарата
            </th>
            <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
              Образец
            </th>
            <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
              Источник
            </th>
            <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
              Качество
            </th>
            {showStorage && (
              <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
                Индив. хранение
              </th>
            )}
            <th className="px-3 py-2.5 text-right text-[11.5px] font-semibold uppercase tracking-wider">
              Создан
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={showStorage ? 7 : 6}
                className="px-4 py-8 text-center text-[12.5px] text-brand-muted"
              >
                Нет подходящих препаратов.
              </td>
            </tr>
          )}
          {filtered.map((r) => {
            const ov = storageOverrides[r.prep.id];
            return (
              <tr
                key={r.prep.id}
                className={classNames(
                  "border-t border-brand-line transition",
                  r.selected ? "bg-brand-cream/60" : "bg-white hover:bg-brand-mint/40"
                )}
              >
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={r.selected}
                    onChange={() => onToggle(r.prep.id)}
                    className="accent-brand-accent"
                    aria-label={`Выбрать ${r.prep.id}`}
                  />
                </td>
                <td className="px-3 py-2.5 font-semibold text-brand-deep">
                  {r.prep.id}
                </td>
                <td className="px-3 py-2.5 text-brand-deep/80">
                  S-{r.prep.sampleId}
                </td>
                <td className="px-3 py-2.5 text-[12.5px] text-brand-deep/80">
                  {sourceLabel
                    ? sourceLabel(r.prep)
                    : r.prep.source.kind === "mix"
                      ? "Смесь растений"
                      : r.prep.source.plantId}
                </td>
                <td className="px-3 py-2.5">
                  <Badge
                    tone={
                      r.prep.quality === "high"
                        ? "mint"
                        : r.prep.quality === "medium"
                          ? "amber"
                          : "red"
                    }
                  >
                    {r.prep.quality === "high"
                      ? "Высокое"
                      : r.prep.quality === "medium"
                        ? "Среднее"
                        : "Низкое"}
                  </Badge>
                </td>
                {showStorage && (
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        value={ov?.fridge ?? r.prep.fridge ?? ""}
                        onChange={(e) =>
                          onStorageChange?.(
                            r.prep.id,
                            e.target.value,
                            ov?.box ?? r.prep.box ?? ""
                          )
                        }
                        placeholder="F-#"
                        className="w-20 rounded-md border border-brand-line bg-white px-2 py-1 text-[12px] outline-none focus:border-brand"
                      />
                      <input
                        value={ov?.box ?? r.prep.box ?? ""}
                        onChange={(e) =>
                          onStorageChange?.(
                            r.prep.id,
                            ov?.fridge ?? r.prep.fridge ?? "",
                            e.target.value
                          )
                        }
                        placeholder="BX-#"
                        className="w-20 rounded-md border border-brand-line bg-white px-2 py-1 text-[12px] outline-none focus:border-brand"
                      />
                    </div>
                  </td>
                )}
                <td className="px-3 py-2.5 text-right text-brand-muted">
                  {fmtDateShort(r.prep.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Pencil, Save, Trash2, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import SectionTitle from "@/components/ui/SectionTitle";
import { selectProbeUsage, useStore } from "@/lib/store";
import type { AtlasProbe } from "@/lib/types";
import ChannelBadge from "../shared/ChannelBadge";

export default function ProbeCard({ probe }: { probe: AtlasProbe }) {
  const nav = useNavigate();
  const fluorochromes = useStore((s) => s.fluorochromes);
  const update = useStore((s) => s.updateAtlasProbe);
  const remove = useStore((s) => s.deleteAtlasProbe);
  const usage = useStore((s) => selectProbeUsage(s, probe.name));

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AtlasProbe>(probe);
  useEffect(() => {
    setDraft(probe);
    setEditing(false);
  }, [probe]);

  const channel = fluorochromes.find((f) => f.id === draft.fluorochromeId)?.channel;

  const onSave = () => {
    update(probe.id, draft);
    setEditing(false);
    toast.success("Зонд обновлён");
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="label-cap">Зонд</div>
          <h2 className="text-[20px] font-extrabold text-brand-deep">
            {draft.name}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button size="sm" onClick={onSave}>
                <Save size={13} /> Сохранить
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDraft(probe);
                  setEditing(false);
                }}
              >
                <Undo2 size={13} /> Отмена
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil size={13} /> Изменить
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  remove(probe.id);
                  toast("Зонд удалён");
                }}
              >
                <Trash2 size={13} /> Удалить
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          label="Название"
          value={draft.name}
          disabled={!editing}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <Input
          label="Мишень"
          value={draft.target ?? ""}
          disabled={!editing}
          onChange={(e) => setDraft({ ...draft, target: e.target.value })}
        />
        <Input
          label="Производитель"
          value={draft.manufacturer ?? ""}
          disabled={!editing}
          onChange={(e) => setDraft({ ...draft, manufacturer: e.target.value })}
        />
        <Select
          label="Флюорохром"
          value={draft.fluorochromeId}
          disabled={!editing}
          onChange={(e) =>
            setDraft({ ...draft, fluorochromeId: e.target.value })
          }
        >
          {fluorochromes.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.channel})
            </option>
          ))}
        </Select>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-brand-mint/40 px-3 py-2 text-[12px] text-brand-deep">
        Канал: {channel ? <ChannelBadge channel={channel} /> : <span className="text-brand-muted">не задан</span>}
        <span className="text-brand-muted">(берётся у флюорохрома)</span>
      </div>
      <Textarea
        label="Заметки"
        value={draft.notes ?? ""}
        disabled={!editing}
        onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        rows={2}
      />

      <div>
        <SectionTitle title="Использован в окрашенных препаратах" />
        {usage.length === 0 ? (
          <div className="mt-2 rounded-lg border border-dashed border-brand-line bg-brand-mint/40 p-3 text-center text-[12px] text-brand-muted">
            Зонд пока не использовался.
          </div>
        ) : (
          <div className="mt-2 max-h-[180px] overflow-y-auto rounded-lg border border-brand-line">
            <table className="w-full text-[12px]">
              <thead className="bg-brand-deep text-brand-cream">
                <tr>
                  <th className="px-2 py-1.5 text-left">STN-id</th>
                  <th className="px-2 py-1.5 text-left">Образец</th>
                  <th className="px-2 py-1.5 text-left">Дата</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-brand-line/60 hover:bg-brand-mint/40"
                  >
                    <td className="px-2 py-1.5 font-mono">{s.id}</td>
                    <td className="px-2 py-1.5">
                      {s.preparationId.split(".").slice(0, 2).join(".")}
                    </td>
                    <td className="px-2 py-1.5 text-brand-muted">
                      {s.hybridizationDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        onClick={() => nav(`/атлас/матрица?probeId=${probe.id}`)}
      >
        <LayoutGrid size={14} /> Показать в матрице атласа
      </Button>
    </Card>
  );
}

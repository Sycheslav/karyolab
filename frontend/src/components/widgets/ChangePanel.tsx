import { useNavigate } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import { fmtTime } from "@/lib/utils";

export default function ChangePanel() {
  const change = useStore((s) => s.lastChange);
  const setChange = useStore((s) => s.setLastChange);
  const nav = useNavigate();

  if (!change || change.length === 0) return null;

  return (
    <Card accent className="relative">
      <button
        onClick={() => setChange(undefined)}
        className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-brand-muted hover:bg-white"
        aria-label="Скрыть"
      >
        <X size={14} />
      </button>
      <h3 className="text-[15px] font-bold text-brand-deep">Что изменилось</h3>
      <ul className="mt-3 space-y-2">
        {change.map((c, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-lg border border-brand-line bg-white p-2.5"
          >
            <CheckCircle2 size={15} className="mt-0.5 text-brand" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-brand-deep">
                {c.title}
              </div>
              {c.detail && (
                <div className="text-[11.5px] text-brand-muted">{c.detail}</div>
              )}
              {c.href && (
                <button
                  className="mt-1 text-[12px] font-bold text-brand hover:underline"
                  onClick={() => {
                    setChange(undefined);
                    nav(c.href!);
                  }}
                >
                  Перейти →
                </button>
              )}
            </div>
            <span className="text-[10.5px] uppercase tracking-wider text-brand-muted">
              {fmtTime(c.ts)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

import type { ReactNode } from "react";
import Card from "@/components/ui/Card";

interface Props {
  list: ReactNode;
  detail: ReactNode;
}

export default function DictionaryShell({ list, detail }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
      <div>{list}</div>
      <div>
        {detail ?? (
          <Card>
            <div className="grid place-items-center text-[12.5px] text-brand-muted">
              Выберите запись слева
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

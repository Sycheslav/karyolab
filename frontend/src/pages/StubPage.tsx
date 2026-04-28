import { Construction } from "lucide-react";

interface Props {
  title: string;
  note?: string;
}

export default function StubPage({ title, note }: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card card-pad text-center">
        <Construction size={42} className="mx-auto text-brand-warn" />
        <h1 className="mt-3 text-[26px] font-extrabold text-brand-deep">
          {title}
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          {note ?? "Раздел в разработке."}
        </p>
      </div>
    </div>
  );
}

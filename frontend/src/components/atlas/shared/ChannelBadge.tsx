import { classNames } from "@/lib/utils";
import type { FluorochromeChannel } from "@/lib/types";

const COLORS: Record<FluorochromeChannel, string> = {
  red: "bg-red-100 text-red-700 border-red-200",
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
};

interface Props {
  channel: FluorochromeChannel;
  className?: string;
}

export default function ChannelBadge({ channel, className }: Props) {
  return (
    <span
      className={classNames(
        "rounded px-1.5 py-px text-[10px] font-bold border uppercase",
        COLORS[channel],
        className
      )}
    >
      {channel}
    </span>
  );
}

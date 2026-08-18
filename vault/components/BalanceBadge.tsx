import { Gem } from "lucide-react";

export default function BalanceBadge({ balance }: { balance: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-surface py-1.5 pl-2.5 pr-3">
      <Gem className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
      <span className="font-mono text-sm font-medium tabular-nums text-gold">
        {balance.toLocaleString("ru-RU")}
      </span>
    </div>
  );
}

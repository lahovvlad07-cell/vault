import { Lock } from "lucide-react";
import BalanceBadge from "./BalanceBadge";

export default function TopBar({ balance }: { balance: number }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-bg/85 pt-safe backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface2 text-violet">
            <Lock className="h-4 w-4" strokeWidth={2} />
          </span>
          <p className="font-display text-lg font-bold leading-none text-ink">Vault</p>
        </div>
        <BalanceBadge balance={balance} />
      </div>
    </header>
  );
}

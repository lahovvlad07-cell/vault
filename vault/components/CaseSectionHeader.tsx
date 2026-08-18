import { Shield, Sparkles, Gem, Shuffle, Gift, type LucideIcon } from "lucide-react";
import type { CaseCategory } from "@/lib/types";

export const CATEGORY_ORDER: CaseCategory[] = ["free", "vpn", "ai", "points", "mixed"];

export const CATEGORY_META: Record<CaseCategory, { label: string; icon: LucideIcon; text: string; bg: string }> = {
  free: { label: "Бесплатно", icon: Gift, text: "text-gold", bg: "bg-gold/10" },
  vpn: { label: "VPN", icon: Shield, text: "text-violet", bg: "bg-violet/10" },
  ai: { label: "AI", icon: Sparkles, text: "text-gold", bg: "bg-gold/10" },
  points: { label: "Поинты", icon: Gem, text: "text-emerald-300", bg: "bg-emerald-400/10" },
  mixed: { label: "Микс", icon: Shuffle, text: "text-sky-300", bg: "bg-sky-400/10" },
};

export default function CaseSectionHeader({ category, count }: { category: CaseCategory; count: number }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2 px-0.5">
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${meta.bg} ${meta.text}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      </span>
      <h2 className="font-display text-sm font-bold text-ink">{meta.label}</h2>
      <span className="font-mono text-[10px] text-muted">{count}</span>
      <span className="ml-1 h-px flex-1 bg-white/5" />
    </div>
  );
}

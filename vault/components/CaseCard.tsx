"use client";

import { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import type { CaseSummary } from "@/lib/types";
import { getRarityTier, RARITY_CLASS, RARITY_LABEL } from "@/lib/rarity";
import PrizeIcon, { CaseIcon } from "./PrizeIcon";

const LID_GRADIENT: Record<string, string> = {
  vpn_mini: "from-violet/15 via-violet/5 to-transparent",
  vpn_box: "from-violet/25 via-violet/5 to-transparent",
  vpn_max: "from-violet/35 via-violet/10 to-transparent",
  ai_mini: "from-gold/15 via-gold/5 to-transparent",
  ai_box: "from-gold/25 via-gold/5 to-transparent",
  ai_max: "from-gold/35 via-gold/10 to-transparent",
  points_mini: "from-emerald-400/12 via-emerald-400/5 to-transparent",
  points_booster: "from-emerald-400/20 via-emerald-400/5 to-transparent",
  points_max: "from-emerald-400/30 via-emerald-400/10 to-transparent",
  mystery_box: "from-sky-400/20 via-sky-400/5 to-transparent",
  vault_box: "from-gold/30 via-violet/15 to-transparent",
  free_box: "from-gold/30 via-violet/10 to-transparent",
};

export default function CaseCard({
  caseDef,
  balance,
  disabled,
  cooldownReason,
  onOpen,
}: {
  caseDef: CaseSummary;
  balance: number;
  disabled?: boolean;
  cooldownReason?: string;
  onOpen: (key: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isFree = caseDef.key === "free_box";
  const canAfford = isFree || balance >= caseDef.price;
  const locked = disabled || !canAfford || (isFree && !!cooldownReason);
  const lid = LID_GRADIENT[caseDef.key] ?? "from-violet/20 via-violet/5 to-transparent";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-card transition hover:border-white/20">
      <div className={`relative flex flex-col items-center gap-2 bg-gradient-to-br ${lid} px-3 pb-3 pt-4 text-center`}>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
            isFree ? "border-gold/40 bg-gold/10 text-gold" : "border-violet/30 bg-violet/10 text-violet"
          }`}
        >
          <CaseIcon isFree={isFree} className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-sm font-bold leading-tight text-ink">{caseDef.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-[10px] leading-tight text-muted">{caseDef.tagline}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <div className="flex items-center justify-between gap-1">
          <p className="font-mono text-xs font-medium text-ink">
            {isFree ? (
              <span className="text-gold">Бесплатно</span>
            ) : (
              <>
                {caseDef.price} <span className="text-muted">пт.</span>
              </>
            )}
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="focus-ring flex items-center gap-0.5 text-[10px] text-muted transition hover:text-ink"
          >
            шансы
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {expanded && (
          <ul className="mt-2 space-y-1.5 border-t border-white/5 pt-2">
            {caseDef.prizes.map((p) => {
              const tier = getRarityTier(p.oddsPercent);
              const c = RARITY_CLASS[tier];
              return (
                <li key={p.label} className="flex items-start justify-between gap-1.5 text-[10px] leading-snug">
                  <span className="flex items-start gap-1.5 text-ink/90">
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded ${c.bg} ${c.text}`}>
                      <PrizeIcon type={p.serviceType} className="h-2.5 w-2.5" />
                    </span>
                    <span>
                      {p.label}
                      <span className={`ml-1 ${c.text}`}>· {RARITY_LABEL[tier]}</span>
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-ink/70">{p.oddsPercent}%</span>
                </li>
              );
            })}
          </ul>
        )}

        <button
          onClick={() => onOpen(caseDef.key)}
          disabled={locked}
          className="focus-ring tap-scale mt-3 w-full rounded-lg bg-violet px-2 py-2.5 text-xs font-medium leading-tight text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-surface2 disabled:text-muted"
        >
          {!canAfford ? "Мало поинтов" : cooldownReason ? "Скоро доступен" : "Открыть"}
        </button>
        {cooldownReason && (
          <p className="mt-1.5 flex items-center gap-1 text-[10px] leading-tight text-muted">
            <Clock className="h-3 w-3 shrink-0" /> {cooldownReason}
          </p>
        )}
      </div>
    </div>
  );
}

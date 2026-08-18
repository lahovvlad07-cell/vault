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

const CATEGORY_LABEL: Record<string, string> = {
  vpn: "VPN",
  ai: "AI",
  points: "Поинты",
  mixed: "Микс",
  free: "Бесплатно",
};

const CATEGORY_BADGE_CLASS: Record<string, string> = {
  vpn: "border-violet/30 bg-violet/10 text-violet",
  ai: "border-gold/30 bg-gold/10 text-gold",
  points: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  mixed: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  free: "border-gold/30 bg-gold/10 text-gold",
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-card transition hover:border-white/20">
      <div className={`relative flex items-center justify-between bg-gradient-to-br ${lid} px-5 py-6`}>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${CATEGORY_BADGE_CLASS[caseDef.category]}`}
            >
              {CATEGORY_LABEL[caseDef.category]}
            </span>
            {isFree && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">раз в 7 дней</span>
            )}
          </div>
          <h3 className="mt-1.5 font-display text-xl font-bold text-ink">{caseDef.title}</h3>
          <p className="mt-0.5 text-xs text-muted">{caseDef.tagline}</p>
        </div>
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${
            isFree ? "border-gold/40 bg-gold/10 text-gold" : "border-violet/30 bg-violet/10 text-violet"
          }`}
        >
          <CaseIcon isFree={isFree} />
        </span>
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center justify-between pt-4">
          <p className="font-mono text-base font-medium text-ink">
            {isFree ? (
              <span className="text-gold">Бесплатно</span>
            ) : (
              <>
                {caseDef.price} <span className="text-muted">поинтов</span>
              </>
            )}
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="focus-ring flex items-center gap-1 text-xs text-muted transition hover:text-ink"
          >
            шансы
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {expanded && (
          <ul className="mt-3 space-y-2 border-t border-white/5 pt-3">
            {caseDef.prizes.map((p) => {
              const tier = getRarityTier(p.oddsPercent);
              const c = RARITY_CLASS[tier];
              return (
                <li key={p.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-ink/90">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md ${c.bg} ${c.text}`}>
                      <PrizeIcon type={p.serviceType} className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      {p.label}
                      <span className={`ml-1.5 ${c.text}`}>· {RARITY_LABEL[tier]}</span>
                    </span>
                  </span>
                  <span className="font-mono text-ink/80">{p.oddsPercent}%</span>
                </li>
              );
            })}
          </ul>
        )}

        <button
          onClick={() => onOpen(caseDef.key)}
          disabled={locked}
          className="focus-ring tap-scale mt-5 w-full rounded-xl bg-violet px-4 py-3 font-medium text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-surface2 disabled:text-muted"
        >
          {!canAfford ? "Недостаточно поинтов" : cooldownReason ? "Скоро будет доступен" : "Открыть кейс"}
        </button>
        {cooldownReason && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Clock className="h-3.5 w-3.5" /> {cooldownReason}
          </p>
        )}
      </div>
    </div>
  );
}

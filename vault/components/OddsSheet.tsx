"use client";

import { X, Percent } from "lucide-react";
import type { CaseSummary } from "@/lib/types";
import { getRarityTier, RARITY_CLASS, RARITY_COLOR, RARITY_LABEL } from "@/lib/rarity";
import PrizeIcon, { CaseIcon } from "./PrizeIcon";

/**
 * Панель шансов — отдельная bottom-sheet модалка вместо инлайн-аккордеона на
 * каждой карточке кейса. Данные (caseDef.prizes с готовым oddsPercent) уже
 * загружены для ВСЕХ кейсов разом через /api/cases при старте приложения —
 * так что модалка не может открыться "пустой": она либо не открыта, либо
 * открыта с полным набором шансов для конкретного кейса.
 */
export default function OddsSheet({ caseDef, onClose }: { caseDef: CaseSummary; onClose: () => void }) {
  const sorted = [...caseDef.prizes].sort((a, b) => b.oddsPercent - a.oddsPercent);
  const isFree = caseDef.key === "free_box";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 backdrop-blur-sm animate-fadeIn sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg animate-sheetUp rounded-t-[28px] border border-white/10 bg-surface p-6 pb-safe shadow-sheet sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/10 sm:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                isFree ? "border-gold/40 bg-gold/10 text-gold" : "border-violet/30 bg-violet/10 text-violet"
              }`}
            >
              <CaseIcon isFree={isFree} className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold leading-tight text-ink">{caseDef.title}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                <Percent className="h-3 w-3" /> {caseDef.prizes.length} возможных исходов
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="focus-ring tap-scale flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface2 text-muted hover:text-ink"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="mt-5 max-h-[55vh] space-y-2 overflow-y-auto pr-0.5">
          {sorted.map((p) => {
            const tier = getRarityTier(p.oddsPercent);
            const c = RARITY_CLASS[tier];
            return (
              <li
                key={p.label}
                className={`rounded-xl border px-3.5 py-3 ${c.border} bg-surface2/60`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
                      <PrizeIcon type={p.serviceType} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{p.label}</p>
                      <p className={`text-[11px] ${c.text}`}>{RARITY_LABEL[tier]}</p>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-medium tabular-nums text-ink">
                    {p.oddsPercent}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg/60">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(p.oddsPercent, 1.5)}%`,
                      backgroundColor: RARITY_COLOR[tier],
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
          Честный ролл через CSPRNG на сервере — результат нельзя подделать через devtools.
        </p>
      </div>
    </div>
  );
}

"use client";

import { History as HistoryIcon } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { getRarityTier, RARITY_CLASS, RARITY_LABEL } from "@/lib/rarity";
import PrizeIcon from "./PrizeIcon";

export default function HistoryTab({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface2 text-muted">
          <HistoryIcon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <p className="text-sm text-muted">
          Пока пусто — откройте кейс, и он&nbsp;появится здесь.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-2 px-4 pb-6 pt-2 sm:grid-cols-2 sm:gap-3 sm:px-6 lg:grid-cols-3">
      {entries.map((e) => {
        const tier = getRarityTier(e.oddsPercent);
        const c = RARITY_CLASS[tier];
        return (
          <li
            key={e.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
                <PrizeIcon type={e.serviceType} className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm text-ink">{e.prizeLabel}</p>
                <p className="text-xs text-muted">
                  {e.caseTitle} · <span className={c.text}>{RARITY_LABEL[tier]}</span>
                </p>
              </div>
            </div>
            <span className="whitespace-nowrap font-mono text-[11px] text-muted">
              {new Date(e.openedAt).toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

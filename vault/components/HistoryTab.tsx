"use client";

import { useState } from "react";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { getRarityTier, RARITY_CLASS, RARITY_LABEL } from "@/lib/rarity";
import { dayBucketLabel, formatRelativeTime } from "@/lib/format";
import PrizeIcon from "./PrizeIcon";

const HISTORY_LIMIT = 40;

function HistorySkeleton() {
  return (
    <div className="space-y-2 px-4 pb-6 pt-2 sm:px-6">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton h-16 animate-shimmer rounded-xl" />
      ))}
    </div>
  );
}

export default function HistoryTab({
  entries,
  loading,
  onClear,
}: {
  entries: HistoryEntry[];
  loading: boolean;
  onClear: () => void;
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  if (loading) return <HistorySkeleton />;

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

  const groups: { label: string; items: HistoryEntry[] }[] = [];
  for (const e of entries) {
    const label = dayBucketLabel(e.openedAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(e);
    else groups.push({ label, items: [e] });
  }

  return (
    <div className="px-4 pb-6 pt-2 sm:px-6">
      <div className="mb-3 flex items-center justify-between px-0.5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Последние {entries.length}
          {entries.length >= HISTORY_LIMIT ? ` (хранятся не больше ${HISTORY_LIMIT})` : ""}
        </p>
        {confirmClear ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted">Очистить всё?</span>
            <button
              onClick={() => {
                onClear();
                setConfirmClear(false);
              }}
              className="focus-ring tap-scale rounded-full bg-danger/15 px-2.5 py-1 text-[11px] font-medium text-danger"
            >
              Да
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="focus-ring tap-scale rounded-full bg-surface2 px-2.5 py-1 text-[11px] text-muted"
            >
              Нет
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className="focus-ring tap-scale flex items-center gap-1 text-[11px] text-muted transition hover:text-danger"
          >
            <Trash2 className="h-3 w-3" /> Очистить
          </button>
        )}
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-0.5 text-[11px] font-medium text-muted">{group.label}</p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((e) => {
                const tier = getRarityTier(e.oddsPercent);
                const c = RARITY_CLASS[tier];
                return (
                  <li
                    key={e.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border-l-2 border bg-surface px-4 py-3 ${c.border}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
                        <PrizeIcon type={e.serviceType} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink">{e.prizeLabel}</p>
                        <p className="truncate text-xs text-muted">
                          {e.caseTitle} · <span className={c.text}>{RARITY_LABEL[tier]}</span>
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-muted">
                      {formatRelativeTime(e.openedAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

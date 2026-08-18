"use client";

import { useState } from "react";
import { PackageOpen, ChevronDown, Sparkles } from "lucide-react";
import type { InventoryItem } from "@/lib/types";
import { hapticImpact, hapticNotification } from "@/lib/telegram";
import PrizeIcon from "./PrizeIcon";

export default function InventoryTab({
  items,
  onActivated,
}: {
  items: InventoryItem[];
  onActivated: (item: InventoryItem) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface2 text-muted">
          <PackageOpen className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <p className="text-sm text-muted">
          Пока пусто — VPN- и AI-призы из кейсов появятся здесь, и их можно будет активировать.
        </p>
      </div>
    );
  }

  async function activate(item: InventoryItem) {
    if (item.activated || busyId) return;
    setBusyId(item.id);
    hapticImpact("light");
    try {
      const res = await fetch("/api/inventory/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (res.ok && data.item) {
        hapticNotification("success");
        setExpandedId(item.id);
        onActivated(data.item);
      }
    } finally {
      setBusyId(null);
    }
  }

  const pending = items.filter((i) => !i.activated);
  const activated = items.filter((i) => i.activated);

  return (
    <div className="space-y-5 px-4 pb-6 pt-2">
      {pending.length > 0 && (
        <div>
          <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-widest text-muted">
            Ждут активации · {pending.length}
          </p>
          <ul className="space-y-2">
            {pending.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold">
                      <PrizeIcon type={item.serviceType} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm text-ink">{item.prizeLabel}</p>
                      <p className="text-xs text-muted">{item.caseTitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => activate(item)}
                    disabled={busyId === item.id}
                    className="focus-ring tap-scale flex shrink-0 items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-medium text-bg transition hover:brightness-110 disabled:opacity-60"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {busyId === item.id ? "Активируем…" : "Активировать"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activated.length > 0 && (
        <div>
          <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-widest text-muted">
            Активировано · {activated.length}
          </p>
          <ul className="space-y-2">
            {activated.map((item) => {
              const isOpen = expandedId === item.id;
              return (
                <li key={item.id} className="rounded-xl border border-white/10 bg-surface px-4 py-3">
                  <button
                    onClick={() => setExpandedId(isOpen ? null : item.id)}
                    className="focus-ring flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet/10 text-violet">
                        <PrizeIcon type={item.serviceType} className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm text-ink">{item.prizeLabel}</p>
                        <p className="text-xs text-muted">{item.caseTitle}</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
                      {item.mock?.note && <p className="text-xs leading-relaxed text-muted">{item.mock.note}</p>}
                      {item.mock?.vlessLink && (
                        <p className="truncate font-mono text-[11px] text-muted">{item.mock.vlessLink}</p>
                      )}
                      {item.promocode && (
                        <p className="font-mono text-xs text-muted">
                          Промокод: <span className="text-ink">{item.promocode}</span>
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

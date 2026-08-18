"use client";

import { useState } from "react";
import { PackageOpen, ChevronDown, Sparkles, Copy, Check } from "lucide-react";
import type { InventoryItem } from "@/lib/types";
import { hapticImpact, hapticNotification } from "@/lib/telegram";
import { formatRelativeTime } from "@/lib/format";
import PrizeIcon from "./PrizeIcon";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      hapticImpact("light");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard недоступен — молча игнорируем, значение и так видно на экране.
    }
  }

  return (
    <button
      onClick={copy}
      className="focus-ring tap-scale flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-surface2 px-2 py-1 text-[10px] text-muted transition hover:text-ink"
    >
      {copied ? <Check className="h-3 w-3 text-violet" /> : <Copy className="h-3 w-3" />}
      {copied ? "Скопировано" : "Копировать"}
    </button>
  );
}

function InventorySkeleton() {
  return (
    <div className="space-y-2 px-4 pb-6 pt-2 sm:px-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton h-16 animate-shimmer rounded-xl" />
      ))}
    </div>
  );
}

export default function InventoryTab({
  items,
  loading,
  onActivated,
}: {
  items: InventoryItem[];
  loading: boolean;
  onActivated: (item: InventoryItem) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) return <InventorySkeleton />;

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
    <div className="space-y-5 px-4 pb-6 pt-2 sm:px-6">
      {pending.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 px-1 font-mono text-[10px] uppercase tracking-widest text-gold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
            Ждут активации · {pending.length}
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            {pending.map((item) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                      <PrizeIcon type={item.serviceType} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{item.prizeLabel}</p>
                      <p className="truncate text-xs text-muted">
                        {item.caseTitle} · {formatRelativeTime(item.wonAt)}
                      </p>
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
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            {activated.map((item) => {
              const isOpen = expandedId === item.id;
              return (
                <li key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-surface px-4 py-3">
                  <button
                    onClick={() => setExpandedId(isOpen ? null : item.id)}
                    className="focus-ring flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-violet">
                        <PrizeIcon type={item.serviceType} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink">{item.prizeLabel}</p>
                        <p className="truncate text-xs text-muted">
                          {item.caseTitle} · {item.activatedAt ? formatRelativeTime(item.activatedAt) : ""}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
                      {item.mock?.note && <p className="text-xs leading-relaxed text-muted">{item.mock.note}</p>}
                      {item.mock?.vlessLink && (
                        <div className="flex items-center gap-2 rounded-lg bg-surface2 px-2.5 py-2">
                          <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted">{item.mock.vlessLink}</p>
                          <CopyButton value={item.mock.vlessLink} />
                        </div>
                      )}
                      {item.promocode && (
                        <div className="flex items-center gap-2 rounded-lg bg-surface2 px-2.5 py-2">
                          <p className="min-w-0 flex-1 truncate font-mono text-xs text-ink">
                            <span className="text-muted">Промокод:</span> {item.promocode}
                          </p>
                          <CopyButton value={item.promocode} />
                        </div>
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

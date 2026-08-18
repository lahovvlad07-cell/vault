"use client";

import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";
import type { CaseCategory } from "@/lib/types";

export type SortKey = "default" | "price_asc" | "price_desc";

const CATEGORIES: { key: CaseCategory | "all"; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "vpn", label: "VPN" },
  { key: "ai", label: "AI" },
  { key: "points", label: "Поинты" },
  { key: "mixed", label: "Микс" },
  { key: "free", label: "Бесплатно" },
];

export default function CaseFilters({
  category,
  onCategoryChange,
  sort,
  onSortChange,
}: {
  category: CaseCategory | "all";
  onCategoryChange: (c: CaseCategory | "all") => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
}) {
  function cycleSort() {
    onSortChange(sort === "default" ? "price_asc" : sort === "price_asc" ? "price_desc" : "default");
  }

  return (
    <div className="space-y-2.5">
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onCategoryChange(c.key)}
              className={`focus-ring tap-scale shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-violet/40 bg-violet/15 text-violet"
                  : "border-white/10 bg-surface text-muted hover:border-white/20 hover:text-ink"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={cycleSort}
        className="focus-ring tap-scale flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-xs text-muted transition hover:text-ink"
      >
        {sort === "price_desc" ? (
          <ArrowDownNarrowWide className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpNarrowWide className="h-3.5 w-3.5" />
        )}
        {sort === "default" && "Сортировка: по умолчанию"}
        {sort === "price_asc" && "Сортировка: цена ↑"}
        {sort === "price_desc" && "Сортировка: цена ↓"}
      </button>
    </div>
  );
}

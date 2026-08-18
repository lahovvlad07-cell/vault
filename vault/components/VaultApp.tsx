"use client";

import { useEffect, useMemo, useState } from "react";
import TopBar from "./TopBar";
import BottomNav, { TabKey } from "./BottomNav";
import TermsGate from "./TermsGate";
import CaseCard from "./CaseCard";
import CaseSectionHeader, { CATEGORY_ORDER } from "./CaseSectionHeader";
import CaseFilters, { SortKey } from "./CaseFilters";
import CaseOpener from "./CaseOpener";
import HistoryTab from "./HistoryTab";
import InventoryTab from "./InventoryTab";
import ProfileTab from "./ProfileTab";
import { hapticImpact } from "@/lib/telegram";
import type { CaseCategory, CaseSummary, HistoryEntry, InventoryItem, OpenCaseResult } from "@/lib/types";

const HISTORY_KEY = "vault_history_v1";

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function CaseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
      <div className="skeleton h-24 animate-shimmer" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-4 w-1/3 animate-shimmer rounded" />
        <div className="skeleton h-11 w-full animate-shimmer rounded-xl" />
      </div>
    </div>
  );
}

export default function VaultApp() {
  const [tab, setTab] = useState<TabKey>("cases");
  const [balance, setBalance] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean | null>(null);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [activeCase, setActiveCase] = useState<CaseSummary | null>(null);
  const [openResult, setOpenResult] = useState<OpenCaseResult | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const [cooldownReason, setCooldownReason] = useState<string | undefined>();
  const [debugBusy, setDebugBusy] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CaseCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("default");

  useEffect(() => {
    setHistory(loadHistory());
    (async () => {
      const [sessionRes, casesRes] = await Promise.all([
        fetch("/api/session").then((r) => r.json()),
        fetch("/api/cases").then((r) => r.json()),
      ]);
      setBalance(sessionRes.balance);
      setAcceptedTerms(sessionRes.acceptedTerms);
      setCases(casesRes.cases);
    })();
  }, []);

  async function refreshInventory() {
    const res = await fetch("/api/inventory");
    if (!res.ok) return;
    const data = await res.json();
    setInventory(data.items ?? []);
    setInventoryLoaded(true);
  }

  useEffect(() => {
    if (acceptedTerms) refreshInventory();
  }, [acceptedTerms]);

  function pushHistory(entry: HistoryEntry) {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 50);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // localStorage недоступен (приватный режим и т.п.) — не критично для демо.
      }
      return next;
    });
  }

  async function handleOpen(key: string) {
    const def = cases.find((c) => c.key === key);
    if (!def) return;
    hapticImpact("light");
    setActiveCase(def);
    setOpenResult(null);
    setOpenError(null);

    const res = await fetch("/api/open-case", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseKey: key }),
    });
    const data = await res.json();

    if (!res.ok) {
      const messages: Record<string, string> = {
        insufficient_balance: "Недостаточно поинтов для открытия этого кейса.",
        cooldown: data.reason || "Бесплатный кейс пока недоступен.",
        terms_not_accepted: "Сначала нужно принять соглашение.",
        unknown_case: "Кейс не найден.",
      };
      setOpenError(messages[data.error] || "Что-то пошло не так.");
      if (data.error === "cooldown" && key === "free_box") setCooldownReason(data.reason);
      return;
    }

    setOpenResult(data);
    setBalance(data.balance);
    if (key === "free_box") setCooldownReason(undefined);
    if (data.pendingActivation) refreshInventory();

    const oddsPercent = def.prizes.find((p) => p.label === data.prize.label)?.oddsPercent ?? 50;
    pushHistory({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      caseTitle: def.title,
      prizeLabel: data.prize.label,
      serviceType: data.prize.serviceType,
      oddsPercent,
      openedAt: new Date().toISOString(),
    });
  }

  function handleInventoryActivated(item: InventoryItem) {
    setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  }

  async function handleDebugTopUp() {
    setDebugBusy(true);
    hapticImpact("light");
    try {
      const res = await fetch("/api/debug-add-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 500 }),
      });
      const data = await res.json();
      setBalance(data.balance);
    } finally {
      setDebugBusy(false);
    }
  }

  const isLoading = acceptedTerms === null;
  const pendingInventoryCount = inventory.filter((i) => !i.activated).length;

  const sections = useMemo(() => {
    const cats = categoryFilter === "all" ? CATEGORY_ORDER : [categoryFilter];
    return cats
      .map((cat) => {
        let list = cases.filter((c) => c.category === cat);
        if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
        if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
        return { category: cat, list };
      })
      .filter((s) => s.list.length > 0);
  }, [cases, categoryFilter, sort]);

  return (
    <main className="min-h-screen bg-grid pb-24">
      <TopBar balance={balance} />

      {!isLoading && !acceptedTerms && <TermsGate onAccept={() => setAcceptedTerms(true)} />}

      <div className="mx-auto w-full max-w-md sm:max-w-3xl sm:px-2 lg:max-w-6xl">
        {tab === "cases" && (
          <section className="space-y-5 px-4 pb-6 pt-4 sm:space-y-6 sm:px-6 sm:pt-6">
            {isLoading ? (
              <>
                <CaseCardSkeleton />
                <CaseCardSkeleton />
                <CaseCardSkeleton />
              </>
            ) : (
              <>
                <CaseFilters
                  category={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  sort={sort}
                  onSortChange={setSort}
                />
                {sections.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted">В этой категории пока нет кейсов.</p>
                ) : (
                  sections.map(({ category, list }) => (
                    <div key={category} className="space-y-2.5">
                      <CaseSectionHeader category={category} count={list.length} />
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                        {list.map((c) => (
                          <CaseCard
                            key={c.key}
                            caseDef={c}
                            balance={balance}
                            onOpen={handleOpen}
                            cooldownReason={c.key === "free_box" ? cooldownReason : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </section>
        )}

        {tab === "inventory" && !isLoading && (
          <InventoryTab items={inventory} onActivated={handleInventoryActivated} />
        )}

        {tab === "history" && !isLoading && <HistoryTab entries={history} />}

        {tab === "profile" && !isLoading && (
          <ProfileTab
            balance={balance}
            acceptedTerms={!!acceptedTerms}
            debugBusy={debugBusy}
            onDebugTopUp={handleDebugTopUp}
          />
        )}
      </div>

      <BottomNav active={tab} onChange={setTab} inventoryBadge={inventoryLoaded ? pendingInventoryCount : undefined} />

      {activeCase && (
        <CaseOpener
          caseDef={activeCase}
          result={openResult}
          error={openError}
          onViewInventory={() => setTab("inventory")}
          onClose={() => {
            setActiveCase(null);
            setOpenResult(null);
            setOpenError(null);
          }}
        />
      )}
    </main>
  );
}

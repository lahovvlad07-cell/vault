"use client";

import { Package, PackageOpen, History, CircleUserRound } from "lucide-react";

export type TabKey = "cases" | "inventory" | "history" | "profile";

const TABS: { key: TabKey; label: string; icon: typeof Package }[] = [
  { key: "cases", label: "Кейсы", icon: Package },
  { key: "inventory", label: "Инвентарь", icon: PackageOpen },
  { key: "history", label: "История", icon: History },
  { key: "profile", label: "Профиль", icon: CircleUserRound },
];

export default function BottomNav({
  active,
  onChange,
  inventoryBadge,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  inventoryBadge?: number;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-bg/90 pb-safe backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-around px-2 pt-1.5 sm:max-w-md sm:justify-center sm:gap-6">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          const badge = key === "inventory" ? inventoryBadge : undefined;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="focus-ring tap-scale flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] transition"
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition ${
                  isActive ? "bg-violet/15 text-violet" : "text-muted"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                {!!badge && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-mono text-[9px] font-bold text-bg">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className={isActive ? "font-medium text-ink" : "text-muted"}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

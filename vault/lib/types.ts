export type ServiceType = "vpn" | "ai" | "points";
export type CaseCategory = "vpn" | "ai" | "points" | "mixed" | "free";

export interface PrizeSummary {
  label: string;
  serviceType: ServiceType;
  oddsPercent: number;
  isFreeTier: boolean;
}

export interface CaseSummary {
  key: string;
  title: string;
  price: number;
  category: CaseCategory;
  tagline: string;
  prizes: PrizeSummary[];
}

export interface OpenCaseResult {
  prize: {
    label: string;
    serviceType: ServiceType;
    rewardValue: string;
  };
  balance: number;
  /** true — приз лёг в инвентарь и ждёт активации (VPN/AI); false — начислен сразу (поинты) */
  pendingActivation: boolean;
  inventoryItemId: string | null;
  historyEntry: HistoryEntry;
}

export interface HistoryEntry {
  id: string;
  caseKey?: string;
  caseTitle: string;
  prizeLabel: string;
  serviceType: ServiceType;
  oddsPercent: number;
  openedAt: string;
}

export interface InventoryItem {
  id: string;
  caseKey: string;
  caseTitle: string;
  prizeLabel: string;
  serviceType: Extract<ServiceType, "vpn" | "ai">;
  rewardValue: string;
  wonAt: string;
  activated: boolean;
  activatedAt: string | null;
  promocode: string | null;
  mock: { note: string; vlessLink?: string } | null;
}

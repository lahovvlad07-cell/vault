/**
 * rarity.ts — визуальная классификация призов по шансу выпадения.
 * Три уровня достаточно для демо: не хотим захламлять интерфейс, но хотим,
 * чтобы цвет и подпись реально что-то говорили о редкости приза, а не были
 * decorative-only.
 */

export type RarityTier = "common" | "rare" | "legendary";

export function getRarityTier(oddsPercent: number): RarityTier {
  if (oddsPercent < 3) return "legendary";
  if (oddsPercent < 15) return "rare";
  return "common";
}

export const RARITY_LABEL: Record<RarityTier, string> = {
  common: "обычный",
  rare: "редкий",
  legendary: "легендарный",
};

export const RARITY_COLOR: Record<RarityTier, string> = {
  common: "#8D8AA3",
  rare: "#8C6FFF",
  legendary: "#E8B04B",
};

export const RARITY_CLASS: Record<RarityTier, { text: string; border: string; bg: string; ring: string }> = {
  common: { text: "text-muted", border: "border-white/10", bg: "bg-surface2", ring: "ring-white/10" },
  rare: { text: "text-violet", border: "border-violet/40", bg: "bg-violet/10", ring: "ring-violet/30" },
  legendary: { text: "text-gold", border: "border-gold/50", bg: "bg-gold/10", ring: "ring-gold/40" },
};

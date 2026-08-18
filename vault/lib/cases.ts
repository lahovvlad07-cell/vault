/**
 * cases.ts — механика кейсов. Веса заданы как целые числа, умноженные на 10
 * (т.е. 0.1% -> 1, 100% -> 1000), чтобы использовать crypto.randomInt без
 * проблем с плавающей точкой. Сумма весов в каждом кейсе = 1000.
 */

import { randomBytes, randomInt } from "crypto";

export type ServiceType = "vpn" | "ai" | "points";
export type CaseCategory = "vpn" | "ai" | "points" | "mixed" | "free";

export interface Prize {
  label: string;
  weight: number; // scaled x10
  serviceType: ServiceType;
  rewardValue: string;
  isFreeTier?: boolean;
}

export interface CaseDef {
  key: string;
  title: string;
  price: number;
  category: CaseCategory;
  tagline: string;
  prizes: Prize[];
}

export const CASES: CaseDef[] = [
  // ───────── VPN ─────────
  {
    key: "vpn_mini",
    title: "VPN Mini",
    price: 20,
    category: "vpn",
    tagline: "Короткие подписки, низкий вход",
    prizes: [
      { label: "3 дня (безлимит)", weight: 550, serviceType: "vpn", rewardValue: "3_days" },
      { label: "7 дней (безлимит)", weight: 300, serviceType: "vpn", rewardValue: "7_days" },
      { label: "14 дней (безлимит)", weight: 130, serviceType: "vpn", rewardValue: "14_days" },
      { label: "30 дней (джекпот)", weight: 20, serviceType: "vpn", rewardValue: "30_days" },
    ],
  },
  {
    key: "vpn_box",
    title: "VPN-Box",
    price: 40,
    category: "vpn",
    tagline: "Классический набор на месяцы",
    prizes: [
      { label: "1 месяц (безлимит)", weight: 600, serviceType: "vpn", rewardValue: "30_days" },
      { label: "3 месяца (безлимит)", weight: 300, serviceType: "vpn", rewardValue: "90_days" },
      { label: "6 месяцев (безлимит)", weight: 90, serviceType: "vpn", rewardValue: "180_days" },
      { label: "12 месяцев (джекпот)", weight: 10, serviceType: "vpn", rewardValue: "365_days" },
    ],
  },
  {
    key: "vpn_max",
    title: "VPN Max",
    price: 90,
    category: "vpn",
    tagline: "Долгие сроки, дороже вход",
    prizes: [
      { label: "3 месяца (безлимит)", weight: 500, serviceType: "vpn", rewardValue: "90_days" },
      { label: "6 месяцев (безлимит)", weight: 300, serviceType: "vpn", rewardValue: "180_days" },
      { label: "12 месяцев (безлимит)", weight: 150, serviceType: "vpn", rewardValue: "365_days" },
      { label: "24 месяца (джекпот)", weight: 50, serviceType: "vpn", rewardValue: "730_days" },
    ],
  },

  // ───────── AI ─────────
  {
    key: "ai_mini",
    title: "AI Mini",
    price: 25,
    category: "ai",
    tagline: "Небольшие пакеты токенов",
    prizes: [
      { label: "20 000 токенов", weight: 600, serviceType: "ai", rewardValue: "20000_tokens" },
      { label: "50 000 токенов", weight: 300, serviceType: "ai", rewardValue: "50000_tokens" },
      { label: "100 000 токенов", weight: 90, serviceType: "ai", rewardValue: "100000_tokens" },
      { label: "Безлимит на 3 дня (джекпот)", weight: 10, serviceType: "ai", rewardValue: "unlimited_3_days" },
    ],
  },
  {
    key: "ai_box",
    title: "AI & Neural Box",
    price: 50,
    category: "ai",
    tagline: "Баланс объёма и качества моделей",
    prizes: [
      { label: "100 000 токенов (все модели)", weight: 550, serviceType: "ai", rewardValue: "100000_tokens" },
      { label: "300 000 токенов + топ-модель", weight: 300, serviceType: "ai", rewardValue: "300000_tokens_top" },
      { label: "Безлимит на 1 месяц (rate-limited)", weight: 120, serviceType: "ai", rewardValue: "unlimited_30_days" },
      { label: "VIP-безлимит на 3 месяца (джекпот)", weight: 30, serviceType: "ai", rewardValue: "vip_unlimited_90_days" },
    ],
  },
  {
    key: "ai_max",
    title: "AI Max",
    price: 110,
    category: "ai",
    tagline: "Крупные пакеты и длинный безлимит",
    prizes: [
      { label: "300 000 токенов", weight: 500, serviceType: "ai", rewardValue: "300000_tokens" },
      { label: "700 000 токенов + топ-модель", weight: 300, serviceType: "ai", rewardValue: "700000_tokens_top" },
      { label: "Безлимит на 2 месяца", weight: 150, serviceType: "ai", rewardValue: "unlimited_60_days" },
      { label: "VIP-безлимит на 6 месяцев (джекпот)", weight: 50, serviceType: "ai", rewardValue: "vip_unlimited_180_days" },
    ],
  },

  // ───────── Points ─────────
  {
    key: "points_mini",
    title: "Points Mini",
    price: 15,
    category: "points",
    tagline: "Дешёвый разгон баланса",
    prizes: [
      { label: "10 поинтов", weight: 550, serviceType: "points", rewardValue: "10" },
      { label: "18 поинтов", weight: 320, serviceType: "points", rewardValue: "18" },
      { label: "35 поинтов", weight: 110, serviceType: "points", rewardValue: "35" },
      { label: "80 поинтов (джекпот)", weight: 20, serviceType: "points", rewardValue: "80" },
    ],
  },
  {
    key: "points_booster",
    title: "Points Booster",
    price: 30,
    category: "points",
    tagline: "Стандартный набор поинтов",
    prizes: [
      { label: "15 поинтов", weight: 450, serviceType: "points", rewardValue: "15" },
      { label: "25 поинтов", weight: 350, serviceType: "points", rewardValue: "25" },
      { label: "45 поинтов", weight: 150, serviceType: "points", rewardValue: "45" },
      { label: "100 поинтов", weight: 45, serviceType: "points", rewardValue: "100" },
      { label: "300 поинтов (джекпот)", weight: 5, serviceType: "points", rewardValue: "300" },
    ],
  },
  {
    key: "points_max",
    title: "Points Max",
    price: 70,
    category: "points",
    tagline: "Для крупных ставок на баланс",
    prizes: [
      { label: "60 поинтов", weight: 500, serviceType: "points", rewardValue: "60" },
      { label: "120 поинтов", weight: 320, serviceType: "points", rewardValue: "120" },
      { label: "250 поинтов", weight: 150, serviceType: "points", rewardValue: "250" },
      { label: "600 поинтов (джекпот)", weight: 30, serviceType: "points", rewardValue: "600" },
    ],
  },

  // ───────── Mixed (любой из трёх сервисов) ─────────
  {
    key: "mystery_box",
    title: "Mystery Box",
    price: 35,
    category: "mixed",
    tagline: "Может выпасть VPN, AI или поинты",
    prizes: [
      { label: "15 поинтов", weight: 350, serviceType: "points", rewardValue: "15" },
      { label: "25 поинтов", weight: 200, serviceType: "points", rewardValue: "25" },
      { label: "3 дня VPN", weight: 200, serviceType: "vpn", rewardValue: "3_days" },
      { label: "7 дней VPN", weight: 100, serviceType: "vpn", rewardValue: "7_days" },
      { label: "20 000 токенов AI", weight: 120, serviceType: "ai", rewardValue: "20000_tokens" },
      { label: "50 000 токенов AI (джекпот)", weight: 30, serviceType: "ai", rewardValue: "50000_tokens" },
    ],
  },
  {
    key: "vault_box",
    title: "Vault Box",
    price: 150,
    category: "mixed",
    tagline: "Топовый микс, максимум разброса",
    prizes: [
      { label: "50 поинтов", weight: 300, serviceType: "points", rewardValue: "50" },
      { label: "120 поинтов", weight: 150, serviceType: "points", rewardValue: "120" },
      { label: "1 месяц VPN", weight: 200, serviceType: "vpn", rewardValue: "30_days" },
      { label: "3 месяца VPN", weight: 100, serviceType: "vpn", rewardValue: "90_days" },
      { label: "100 000 токенов AI", weight: 150, serviceType: "ai", rewardValue: "100000_tokens" },
      { label: "Безлимит AI на 1 месяц", weight: 70, serviceType: "ai", rewardValue: "unlimited_30_days" },
      { label: "12 месяцев VPN (джекпот)", weight: 20, serviceType: "vpn", rewardValue: "365_days" },
      { label: "VIP-безлимит AI 3 мес. (джекпот)", weight: 10, serviceType: "ai", rewardValue: "vip_unlimited_90_days" },
    ],
  },

  // ───────── Free ─────────
  {
    key: "free_box",
    title: "Daily / Weekly Free Box",
    price: 0,
    category: "free",
    tagline: "Раз в 7 дней — бесплатно",
    prizes: [
      { label: "VPN-тест: 1 день / 2 ГБ", weight: 700, serviceType: "vpn", rewardValue: "1_day_2gb", isFreeTier: true },
      { label: "AI-тест: 5–10 запросов", weight: 200, serviceType: "ai", rewardValue: "5_10_requests_light", isFreeTier: true },
      { label: "5–10 поинтов", weight: 99, serviceType: "points", rewardValue: "5" },
      { label: "VPN-подписка 1 месяц (джекпот)", weight: 1, serviceType: "vpn", rewardValue: "30_days", isFreeTier: true },
    ],
  },
];

export function getCase(key: string): CaseDef | undefined {
  return CASES.find((c) => c.key === key);
}

export function rollCase(caseKey: string): Prize {
  const def = getCase(caseKey);
  if (!def) throw new Error("unknown_case");
  const total = def.prizes.reduce((sum, p) => sum + p.weight, 0);
  const roll = randomInt(0, total); // CSPRNG, [0, total)
  let cumulative = 0;
  for (const prize of def.prizes) {
    cumulative += prize.weight;
    if (roll < cumulative) return prize;
  }
  return def.prizes[def.prizes.length - 1];
}

export function generatePromocode(): string {
  return randomBytes(8).toString("hex").toUpperCase();
}

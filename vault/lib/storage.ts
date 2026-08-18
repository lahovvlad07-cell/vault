/**
 * storage.ts — работа с Redis. Ключи используют абстрактный userId (сейчас —
 * анонимный session id из cookie; при переносе на Telegram — telegram_id).
 *
 * ВНИМАНИЕ (ограничение прототипа): spendPoints() ниже делает GET, потом
 * HINCRBY — это не атомарная операция и в теории уязвима к гонкам при
 * параллельных запросах одного пользователя (например, если открыть один
 * и тот же кейс из двух вкладок одновременно). Для продакшна замените на
 * Redis Lua-скрипт (EVAL) с проверкой-и-списанием одной командой.
 */

import { redis } from "./redis";

export async function ensureUser(userId: string) {
  const key = `user:${userId}`;
  const exists = await redis.exists(key);
  if (!exists) {
    await redis.hset(key, {
      balance: 0,
      accepted_terms: 0,
      created_at: new Date().toISOString(),
    });
  }
}

export async function getBalance(userId: string): Promise<number> {
  const val = await redis.hget<number>(`user:${userId}`, "balance");
  return Number(val) || 0;
}

export async function hasAcceptedTerms(userId: string): Promise<boolean> {
  const val = await redis.hget<number>(`user:${userId}`, "accepted_terms");
  return Number(val) === 1;
}

export async function setAcceptedTerms(userId: string) {
  await redis.hset(`user:${userId}`, { accepted_terms: 1 });
}

export async function addPoints(userId: string, amount: number) {
  await redis.hincrby(`user:${userId}`, "balance", amount);
}

export async function spendPoints(userId: string, amount: number): Promise<boolean> {
  const balance = await getBalance(userId);
  if (balance < amount) return false;
  await redis.hincrby(`user:${userId}`, "balance", -amount);
  return true;
}

export async function canOpenFreeCase(userId: string): Promise<{ ok: boolean; reason: string }> {
  const last = await redis.get<string>(`freecase:${userId}:last_opened`);
  if (!last) return { ok: true, reason: "" };
  const lastMs = new Date(last).getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - lastMs;
  if (elapsed >= sevenDaysMs) return { ok: true, reason: "" };
  const hoursLeft = Math.ceil((sevenDaysMs - elapsed) / (60 * 60 * 1000));
  return { ok: false, reason: `Следующий бесплатный кейс будет доступен через ~${hoursLeft} ч.` };
}

export async function markFreeCaseOpened(userId: string) {
  await redis.set(`freecase:${userId}:last_opened`, new Date().toISOString());
}

export async function logCaseOpen(
  userId: string,
  caseKey: string,
  prizeLabel: string,
  promocode: string | null
) {
  const entry = `${new Date().toISOString()}|${userId}|${caseKey}|${prizeLabel}|${promocode ?? ""}`;
  await redis.lpush("case_open_log", entry);
  await redis.ltrim("case_open_log", 0, 499);
}

/**
 * Инвентарь — VPN/AI-призы попадают сюда сразу необактивированными.
 * Промокод/мок-ссылка генерируются только в момент активации (см.
 * /api/inventory/activate), а не в момент выпадения приза из кейса —
 * так в модалке открытия кейса до активации видно только "что выпало".
 * Храним как Redis-хэш userId -> { itemId: JSON }, порядок восстанавливаем
 * по полю wonAt при чтении.
 */
export interface InventoryRecord {
  id: string;
  caseKey: string;
  caseTitle: string;
  prizeLabel: string;
  serviceType: "vpn" | "ai";
  rewardValue: string;
  wonAt: string;
  activated: boolean;
  activatedAt: string | null;
  promocode: string | null;
  mock: { note: string; vlessLink?: string } | null;
}

function parseInventoryValue(raw: unknown): InventoryRecord {
  return typeof raw === "string" ? JSON.parse(raw) : (raw as InventoryRecord);
}

export async function addInventoryItem(userId: string, item: InventoryRecord) {
  await redis.hset(`inventory:${userId}`, { [item.id]: JSON.stringify(item) });
}

export async function listInventory(userId: string): Promise<InventoryRecord[]> {
  const raw = await redis.hgetall<Record<string, unknown>>(`inventory:${userId}`);
  if (!raw) return [];
  return Object.values(raw)
    .map(parseInventoryValue)
    .sort((a, b) => new Date(b.wonAt).getTime() - new Date(a.wonAt).getTime());
}

export async function getInventoryItem(userId: string, itemId: string): Promise<InventoryRecord | null> {
  const raw = await redis.hget<unknown>(`inventory:${userId}`, itemId);
  if (raw === null || raw === undefined) return null;
  return parseInventoryValue(raw);
}

export async function activateInventoryItem(
  userId: string,
  itemId: string,
  promocode: string,
  mock: { note: string; vlessLink?: string }
): Promise<InventoryRecord | null> {
  const item = await getInventoryItem(userId, itemId);
  if (!item) return null;
  if (item.activated) return item; // идемпотентно — уже активирован ранее
  const updated: InventoryRecord = {
    ...item,
    activated: true,
    activatedAt: new Date().toISOString(),
    promocode,
    mock,
  };
  await redis.hset(`inventory:${userId}`, { [itemId]: JSON.stringify(updated) });
  return updated;
}

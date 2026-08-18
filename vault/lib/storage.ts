/**
 * storage.ts — работа с Redis. Ключи используют абстрактный userId (сейчас —
 * анонимный session id из cookie; при переносе на Telegram — telegram_id).
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

// Атомарная проверка-и-списание одной Lua-командой (EVAL) — так баланс
// нельзя потратить дважды параллельными запросами (например, из двух вкладок
// одновременно). Раньше здесь были раздельные GET + HINCRBY, что оставляло
// окно гонки между чтением и записью.
const SPEND_POINTS_SCRIPT = `
local key = KEYS[1]
local amount = tonumber(ARGV[1])
local balance = tonumber(redis.call('HGET', key, 'balance') or '0')
if balance < amount then
  return 0
end
redis.call('HINCRBY', key, 'balance', -amount)
return 1
`;

export async function spendPoints(userId: string, amount: number): Promise<boolean> {
  const ok = await redis.eval(SPEND_POINTS_SCRIPT, [`user:${userId}`], [amount]);
  return Number(ok) === 1;
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

/**
 * История открытий — персональная, хранится как capped Redis-list (LPUSH +
 * LTRIM), а не в localStorage браузера. Так она:
 *  - не растёт бесконечно (жёсткий предел HISTORY_LIMIT записей на юзера);
 *  - переживает очистку кэша/смену устройства в рамках одной сессии;
 *  - не может "потеряться" рассинхронизировавшись с сервером.
 */
export interface HistoryRecord {
  id: string;
  caseKey: string;
  caseTitle: string;
  prizeLabel: string;
  serviceType: "vpn" | "ai" | "points";
  oddsPercent: number;
  openedAt: string;
}

export const HISTORY_LIMIT = 40;

function parseHistoryValue(raw: unknown): HistoryRecord {
  return typeof raw === "string" ? JSON.parse(raw) : (raw as HistoryRecord);
}

export async function addHistoryEntry(userId: string, entry: HistoryRecord) {
  const key = `history:${userId}`;
  await redis.lpush(key, JSON.stringify(entry));
  await redis.ltrim(key, 0, HISTORY_LIMIT - 1);
}

export async function listHistory(userId: string): Promise<HistoryRecord[]> {
  const raw = await redis.lrange<unknown>(`history:${userId}`, 0, HISTORY_LIMIT - 1);
  if (!raw) return [];
  return raw.map(parseHistoryValue);
}

export async function clearHistory(userId: string) {
  await redis.del(`history:${userId}`);
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

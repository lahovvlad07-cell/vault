import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { readSessionId, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";
import {
  ensureUser,
  hasAcceptedTerms,
  spendPoints,
  addPoints,
  canOpenFreeCase,
  markFreeCaseOpened,
  addHistoryEntry,
  getBalance,
  addInventoryItem,
} from "@/lib/storage";
import { getCase, rollCase, getPrizeOddsPercent } from "@/lib/cases";

export async function POST(req: NextRequest) {
  const userId = readSessionId(req);
  await ensureUser(userId);

  const withCookie = (res: NextResponse) => {
    res.cookies.set(SESSION_COOKIE, userId, sessionCookieOptions());
    return res;
  };

  if (!(await hasAcceptedTerms(userId))) {
    return withCookie(NextResponse.json({ error: "terms_not_accepted" }, { status: 403 }));
  }

  const body = await req.json().catch(() => ({}));
  const caseKey = body?.caseKey as string | undefined;
  const def = caseKey ? getCase(caseKey) : undefined;
  if (!def) {
    return withCookie(NextResponse.json({ error: "unknown_case" }, { status: 400 }));
  }

  if (def.key === "free_box") {
    const { ok, reason } = await canOpenFreeCase(userId);
    if (!ok) {
      return withCookie(NextResponse.json({ error: "cooldown", reason }, { status: 429 }));
    }
    await markFreeCaseOpened(userId);
  } else {
    const spent = await spendPoints(userId, def.price);
    if (!spent) {
      return withCookie(NextResponse.json({ error: "insufficient_balance" }, { status: 400 }));
    }
  }

  const prize = rollCase(def.key);
  const oddsPercent = getPrizeOddsPercent(def, prize);
  let pendingActivation = false;
  let inventoryItemId: string | null = null;

  if (prize.serviceType === "points") {
    // Поинты — это баланс, а не "приз", который нужно активировать: начисляем сразу.
    await addPoints(userId, Number(prize.rewardValue));
  } else {
    // VPN/AI ложатся в инвентарь необактивированными. Промокод и мок-ссылка
    // генерируются только при активации (см. /api/inventory/activate) —
    // до этого в ответе нет ничего, кроме факта и названия выигрыша.
    pendingActivation = true;
    inventoryItemId = randomUUID();
    await addInventoryItem(userId, {
      id: inventoryItemId,
      caseKey: def.key,
      caseTitle: def.title,
      prizeLabel: prize.label,
      serviceType: prize.serviceType,
      rewardValue: prize.rewardValue,
      wonAt: new Date().toISOString(),
      activated: false,
      activatedAt: null,
      promocode: null,
      mock: null,
    });
  }

  const historyEntry = {
    id: randomUUID(),
    caseKey: def.key,
    caseTitle: def.title,
    prizeLabel: prize.label,
    serviceType: prize.serviceType,
    oddsPercent,
    openedAt: new Date().toISOString(),
  };
  await addHistoryEntry(userId, historyEntry);
  const balance = await getBalance(userId);

  return withCookie(
    NextResponse.json({
      prize: {
        label: prize.label,
        serviceType: prize.serviceType,
        rewardValue: prize.rewardValue,
      },
      balance,
      pendingActivation,
      inventoryItemId,
      historyEntry,
    })
  );
}

import { NextRequest, NextResponse } from "next/server";
import { readSessionId, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";
import { ensureUser, getInventoryItem, activateInventoryItem } from "@/lib/storage";
import { generatePromocode } from "@/lib/cases";
import { issueMockVpnKey, issueMockAiGrant } from "@/lib/mockSatellites";

export async function POST(req: NextRequest) {
  const userId = readSessionId(req);
  await ensureUser(userId);

  const withCookie = (res: NextResponse) => {
    res.cookies.set(SESSION_COOKIE, userId, sessionCookieOptions());
    return res;
  };

  const body = await req.json().catch(() => ({}));
  const itemId = body?.itemId as string | undefined;
  if (!itemId) {
    return withCookie(NextResponse.json({ error: "missing_item_id" }, { status: 400 }));
  }

  const existing = await getInventoryItem(userId, itemId);
  if (!existing) {
    return withCookie(NextResponse.json({ error: "not_found" }, { status: 404 }));
  }

  // Уже активирован — просто отдаём как есть (идемпотентно, без повторной генерации).
  if (existing.activated) {
    return withCookie(NextResponse.json({ item: existing }));
  }

  const promocode = generatePromocode();
  const mock =
    existing.serviceType === "vpn"
      ? issueMockVpnKey(existing.rewardValue)
      : issueMockAiGrant(existing.rewardValue);

  const updated = await activateInventoryItem(userId, itemId, promocode, mock);
  return withCookie(NextResponse.json({ item: updated }));
}

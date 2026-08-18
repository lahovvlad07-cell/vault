import { NextRequest, NextResponse } from "next/server";
import { readSessionId, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";
import { ensureUser, listInventory } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const userId = readSessionId(req);
  await ensureUser(userId);
  const items = await listInventory(userId);

  const res = NextResponse.json({ items });
  res.cookies.set(SESSION_COOKIE, userId, sessionCookieOptions());
  return res;
}

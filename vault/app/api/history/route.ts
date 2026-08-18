import { NextRequest, NextResponse } from "next/server";
import { readSessionId, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";
import { ensureUser, listHistory, clearHistory } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const userId = readSessionId(req);
  await ensureUser(userId);
  const entries = await listHistory(userId);

  const res = NextResponse.json({ entries });
  res.cookies.set(SESSION_COOKIE, userId, sessionCookieOptions());
  return res;
}

export async function DELETE(req: NextRequest) {
  const userId = readSessionId(req);
  await ensureUser(userId);
  await clearHistory(userId);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, userId, sessionCookieOptions());
  return res;
}

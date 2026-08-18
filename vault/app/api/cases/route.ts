import { NextResponse } from "next/server";
import { CASES, getPrizeOddsPercent } from "@/lib/cases";

export async function GET() {
  const payload = CASES.map((c) => ({
    key: c.key,
    title: c.title,
    price: c.price,
    category: c.category,
    tagline: c.tagline,
    prizes: c.prizes.map((p) => ({
      label: p.label,
      serviceType: p.serviceType,
      oddsPercent: getPrizeOddsPercent(c, p),
      isFreeTier: !!p.isFreeTier,
    })),
  }));
  return NextResponse.json({ cases: payload });
}

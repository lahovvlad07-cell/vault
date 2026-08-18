"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { hapticImpact } from "@/lib/telegram";

export default function TermsGate({ onAccept }: { onAccept: () => void }) {
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    hapticImpact("light");
    try {
      await fetch("/api/accept-terms", { method: "POST" });
      onAccept();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/85 backdrop-blur-sm animate-fadeIn sm:items-center sm:p-6">
      <div className="w-full max-w-md animate-sheetUp rounded-t-[28px] border border-white/10 bg-surface p-6 pb-safe shadow-sheet sm:rounded-[28px]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/10 sm:hidden" />

        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet/30 bg-violet/10 text-violet">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
        </span>

        <h2 className="mt-4 font-display text-xl font-bold text-ink">Прежде чем начать</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Поинты — виртуальные единицы внутри демо-сервиса. Они не имеют
          денежной стоимости, не подлежат обмену на наличные средства или
          криптовалюту и не выводятся за пределы системы. Открытие кейса —
          демонстрация механики распределения цифровых наград; все VPN- и
          AI-награды в этом прототипе являются мок-заглушками.
        </p>
        <button
          onClick={accept}
          disabled={loading}
          className="focus-ring tap-scale mt-6 w-full rounded-xl bg-violet px-4 py-3.5 font-medium text-ink transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "…" : "Принять и продолжить"}
        </button>
      </div>
    </div>
  );
}

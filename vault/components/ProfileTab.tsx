"use client";

import { CircleUserRound, Sparkles, Info, ShieldCheck } from "lucide-react";

export default function ProfileTab({
  balance,
  acceptedTerms,
  debugBusy,
  onDebugTopUp,
}: {
  balance: number;
  acceptedTerms: boolean;
  debugBusy: boolean;
  onDebugTopUp: () => void;
}) {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pb-6 pt-4 sm:px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface2 text-violet">
          <CircleUserRound className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <div>
          <p className="font-display text-base font-bold text-ink">Гость</p>
          <p className="text-xs text-muted">Анонимная сессия · демо-режим</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">баланс</p>
        <p className="mt-1 font-mono text-3xl font-medium tabular-nums text-gold">
          {balance.toLocaleString("ru-RU")}
        </p>
        <button
          onClick={onDebugTopUp}
          disabled={debugBusy}
          className="focus-ring tap-scale mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface2 px-4 py-3 text-sm font-medium text-ink transition hover:border-white/20 disabled:opacity-50"
          title="Заглушка вместо платёжного шлюза — только для теста"
        >
          <Sparkles className="h-4 w-4 text-gold" />
          {debugBusy ? "Начисляем…" : "+500 поинтов (демо)"}
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-surface p-5">
        <ShieldCheck className={`mt-0.5 h-4 w-4 shrink-0 ${acceptedTerms ? "text-violet" : "text-muted"}`} />
        <div>
          <p className="text-sm text-ink">
            {acceptedTerms ? "Условия использования приняты" : "Условия ещё не приняты"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Поинты — виртуальные единицы демо-сервиса, без денежной стоимости и обмена на
            наличные или криптовалюту.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-white/10 p-5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
        <p className="text-xs leading-relaxed text-muted">
          Все награды здесь — заглушки. VPN-ссылки и AI-доступ не выдаются по-настоящему,
          пополнение баланса временно заменено демо-кнопкой вместо платёжного шлюза.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronsRight, PackageOpen } from "lucide-react";
import type { CaseSummary, OpenCaseResult } from "@/lib/types";
import { getRarityTier, RARITY_CLASS, RARITY_COLOR, RARITY_LABEL } from "@/lib/rarity";
import { hapticImpact, hapticNotification } from "@/lib/telegram";
import PrizeIcon from "./PrizeIcon";

const ITEM_BOX = 112; // px — ширина карточки (w-28)
const ITEM_GAP = 8; // px — gap-2 между карточками
const TRACK_PADDING = 8; // px — p-2 на треке (сдвигает первую карточку)
const ITEM_PITCH = ITEM_BOX + ITEM_GAP; // px — фактическое расстояние между началами соседних карточек
const LANDING_INDEX = 26;
const STRIP_LENGTH = 32;
const SPIN_DURATION_MS = 5200; // помедленнее — меньше «мыла» на быстрых кадрах

export default function CaseOpener({
  caseDef,
  result,
  error,
  onClose,
  onViewInventory,
}: {
  caseDef: CaseSummary;
  result: OpenCaseResult | null;
  error: string | null;
  onClose: () => void;
  onViewInventory: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(false);
  const [offset, setOffset] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; left: number; color: string; delay: number }[]>([]);

  // Определяем редкость выпавшего приза по каталогу кейса (API отдаёт только
  // сам приз, шанс ищем по совпадению label).
  const landedTier = useMemo(() => {
    if (!result) return "common" as const;
    const match = caseDef.prizes.find((p) => p.label === result.prize.label);
    return getRarityTier(match?.oddsPercent ?? 50);
  }, [caseDef, result]);

  const strip = useMemo(() => {
    const pool = caseDef.prizes;
    return Array.from({ length: STRIP_LENGTH }, (_, i) => {
      if (i === LANDING_INDEX && result) {
        const match = pool.find((p) => p.label === result.prize.label);
        return {
          label: result.prize.label,
          serviceType: result.prize.serviceType,
          oddsPercent: match?.oddsPercent ?? 50,
        };
      }
      const p = pool[Math.floor(Math.random() * pool.length)];
      return { label: p.label, serviceType: p.serviceType, oddsPercent: p.oddsPercent };
    });
  }, [caseDef, result]);

  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function settle() {
    if (!result) return;
    setSettled(true);
    const tier = getRarityTier(
      caseDef.prizes.find((p) => p.label === result.prize.label)?.oddsPercent ?? 50
    );
    if (tier === "legendary") {
      hapticNotification("success");
      setConfetti(
        Array.from({ length: 26 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          color: [RARITY_COLOR.legendary, RARITY_COLOR.rare, "#EDEAF6"][i % 3],
          delay: Math.random() * 0.3,
        }))
      );
    } else if (tier === "rare") {
      hapticImpact("medium");
      setConfetti(
        Array.from({ length: 14 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          color: RARITY_COLOR.rare,
          delay: Math.random() * 0.3,
        }))
      );
    } else {
      hapticImpact("light");
    }
  }

  useEffect(() => {
    if (!result || !trackRef.current) return;
    const containerWidth = trackRef.current.parentElement?.clientWidth ?? 480;
    // Центр карточки LANDING_INDEX относительно начала трека:
    // левый паддинг трека + i полных "шагов" (карточка+гэп) + половина ширины карточки.
    const landingCenter = TRACK_PADDING + LANDING_INDEX * ITEM_PITCH + ITEM_BOX / 2;
    const target = landingCenter - containerWidth / 2;
    setOffset(0);
    setSettled(false);
    setSkipped(false);
    if (trackRef.current) trackRef.current.style.transitionDuration = `${SPIN_DURATION_MS / 1000}s`;
    hapticImpact("light");
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setOffset(target), 30);
    });
    settleTimerRef.current = setTimeout(settle, SPIN_DURATION_MS);

    return () => {
      cancelAnimationFrame(raf);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [result, caseDef]);

  function handleSkip() {
    if (settled || skipped || !trackRef.current) return;
    setSkipped(true);
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    // резко ускоряем ленту до конечной позиции вместо мгновенного скачка —
    // так глаз всё равно успевает считать переход, а не просто дёргается кадр
    trackRef.current.style.transitionDuration = "0.4s";
    trackRef.current.style.transitionTimingFunction = "ease-out";
    setTimeout(settle, 420);
  }

  const tierClass = RARITY_CLASS[landedTier];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 backdrop-blur-sm animate-fadeIn sm:items-center sm:p-6">
      <div className="relative w-full max-w-lg animate-sheetUp rounded-t-[28px] border border-white/10 bg-surface p-6 pb-safe shadow-sheet sm:rounded-[28px]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/10 sm:hidden" />

        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink">{caseDef.title}</h3>
          <button
            onClick={onClose}
            className="focus-ring tap-scale flex h-9 w-9 items-center justify-center rounded-full bg-surface2 text-muted hover:text-ink"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        {!error && !result && (
          <div className="mt-8 flex flex-col items-center gap-3 py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet/30 border-t-violet" />
            <p className="text-sm text-muted">Открываем кейс…</p>
          </div>
        )}

        {!error && result && (
          <>
            <div className="relative mt-6 h-32 overflow-hidden rounded-2xl border border-white/10 bg-bg bg-grid">
              <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-full w-0.5 -translate-x-1/2 bg-gold shadow-glow" />
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-bg to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-bg to-transparent" />
              <div
                ref={trackRef}
                className="flex h-full items-center gap-2 p-2 ease-out"
                style={{
                  transitionProperty: "transform",
                  transitionDuration: `${SPIN_DURATION_MS / 1000}s`,
                  transitionTimingFunction: "cubic-bezier(0.1, 0.7, 0.15, 1)",
                  transform: `translate3d(-${offset}px, 0, 0)`,
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                }}
              >
                {strip.map((item, i) => {
                  const tier = getRarityTier(item.oddsPercent);
                  const c = RARITY_CLASS[tier];
                  const isLanding = i === LANDING_INDEX;
                  return (
                    <div
                      key={i}
                      className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border text-center transition ${
                        isLanding && settled ? `${tierClass.border} ${tierClass.bg} ring-2 ${tierClass.ring}` : `${c.border} ${c.bg}`
                      }`}
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <PrizeIcon
                        type={item.serviceType}
                        className={`h-7 w-7 ${isLanding && settled ? tierClass.text : c.text}`}
                      />
                      <span className="px-1.5 text-[10px] leading-tight text-muted">
                        {item.label.length > 20 ? item.label.slice(0, 18) + "…" : item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {confetti.map((c) => (
                <span
                  key={c.id}
                  className="pointer-events-none absolute top-1/2 h-1.5 w-1.5 animate-confetti rounded-sm"
                  style={{
                    left: `${c.left}%`,
                    backgroundColor: c.color,
                    animationDelay: `${c.delay}s`,
                  }}
                />
              ))}

              {!settled && (
                <button
                  onClick={handleSkip}
                  className="focus-ring tap-scale absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-full border border-white/10 bg-bg/80 px-2.5 py-1 text-[11px] text-muted backdrop-blur hover:text-ink"
                >
                  Пропустить <ChevronsRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {settled && (
              <div className={`mt-5 rounded-2xl border p-4 ${tierClass.border} ${tierClass.bg}`}>
                <p className={`font-mono text-xs uppercase tracking-wide ${tierClass.text}`}>
                  Выпало · {RARITY_LABEL[landedTier]}
                </p>
                <p className="mt-1 font-display text-lg font-bold text-ink">{result.prize.label}</p>

                {result.pendingActivation ? (
                  <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted">
                    <PackageOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Приз добавлен в инвентарь. Промокод и детали появятся там после активации.
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-muted">Поинты зачислены на баланс.</p>
                )}

                <div className="mt-4 flex gap-2">
                  {result.pendingActivation && (
                    <button
                      onClick={() => {
                        onViewInventory();
                        onClose();
                      }}
                      className="focus-ring tap-scale flex-1 rounded-xl border border-white/10 bg-surface2 px-4 py-3 font-medium text-ink transition hover:border-white/20"
                    >
                      В инвентарь
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="focus-ring tap-scale flex-1 rounded-xl bg-ink px-4 py-3 font-medium text-bg transition hover:brightness-95"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <button
            onClick={onClose}
            className="focus-ring tap-scale mt-6 w-full rounded-xl bg-surface2 px-4 py-3 font-medium text-ink transition hover:brightness-110"
          >
            Закрыть
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * telegram.ts — тонкая обёртка над Telegram WebApp SDK. Приложение уже
 * сегодня работает как обычный сайт, но задумано как основа для Telegram
 * Mini App, поэтому весь telegram-специфичный код изолирован здесь и не
 * ломает работу вне Telegram (все вызовы — no-op в обычном браузере,
 * кроме мягкого fallback на navigator.vibrate).
 */

type HapticStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotificationType = "success" | "warning" | "error";

function getTelegramWebApp(): any {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp ?? null;
}

export function initTelegram() {
  const tg = getTelegramWebApp();
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.("#0A0B12");
    tg.setBackgroundColor?.("#0A0B12");
    tg.disableVerticalSwipes?.();
  } catch {
    // Telegram SDK недоступен или отличается версией — просто игнорируем.
  }
}

export function hapticImpact(style: HapticStyle = "medium") {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback?.impactOccurred) {
    tg.HapticFeedback.impactOccurred(style);
    return;
  }
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(style === "heavy" ? 40 : style === "light" ? 10 : 20);
  }
}

export function hapticNotification(type: NotificationType = "success") {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback?.notificationOccurred) {
    tg.HapticFeedback.notificationOccurred(type);
    return;
  }
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(type === "error" ? [20, 40, 20] : 30);
  }
}

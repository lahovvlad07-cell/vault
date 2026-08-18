/**
 * format.ts — общие функции форматирования для History/Inventory,
 * чтобы не дублировать логику "сегодня / вчера / N дней назад".
 */

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24 && isSameDay(date, now)) return `сегодня, ${timeOnly(date)}`;
  if (diffHours < 48 && isSameDay(date, yesterday(now))) return `вчера, ${timeOnly(date)}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} дн назад`;
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function dayBucketLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  if (isSameDay(date, now)) return "Сегодня";
  if (isSameDay(date, yesterday(now))) return "Вчера";
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" });
}

function timeOnly(date: Date): string {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function yesterday(from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - 1);
  return d;
}

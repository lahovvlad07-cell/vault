"use client";

import { useEffect } from "react";
import { initTelegram } from "@/lib/telegram";

/**
 * Вызывает Telegram.WebApp.ready()/expand() при монтировании. Сам SDK
 * подключается через <Script> в app/layout.tsx — этот компонент только
 * инициализирует его на клиенте.
 */
export default function TelegramReady() {
  useEffect(() => {
    initTelegram();
  }, []);
  return null;
}

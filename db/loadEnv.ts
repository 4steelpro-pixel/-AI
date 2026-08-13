import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Загружает переменные окружения из .env.local / .env в process.env.
 * Нужен для скриптов, запускаемых через tsx (db:migrate, db:seed),
 * т.к. Next.js подгружает .env.local только для своего рантайма.
 * Уже заданные переменные окружения не перезаписываются.
 */
export function loadEnv() {
  const root = path.join(__dirname, "..");
  for (const file of [".env.local", ".env"]) {
    const filePath = path.join(root, file);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf-8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const eq = line.indexOf("=");
      if (eq === -1) continue;

      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();

      // Убираем обрамляющие кавычки
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

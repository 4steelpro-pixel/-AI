import { getPool } from "@/lib/db/client";

export const DEFAULT_PRICE_CENTS = 29900;

export interface AppSettings {
  require_payment: boolean;
  price_cents: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  require_payment: true,
  price_cents: DEFAULT_PRICE_CENTS,
};

/** Возвращает настройки приложения (с дефолтами, если в БД их нет). */
export async function getSettings(): Promise<AppSettings> {
  const pool = getPool();
  const { rows } = await pool.query(`select key, value from settings`);
  const settings: AppSettings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key === "require_payment") {
      settings.require_payment = row.value === true || row.value === "true";
    }
    if (row.key === "price_cents") {
      const n = Number(row.value);
      if (Number.isFinite(n) && n > 0) settings.price_cents = Math.round(n);
    }
  }
  return settings;
}

/** Сохраняет настройки приложения. */
export async function saveSettings(patch: Partial<AppSettings>) {
  const pool = getPool();
  const entries: [string, unknown][] = [];
  if (patch.require_payment !== undefined) entries.push(["require_payment", patch.require_payment]);
  if (patch.price_cents !== undefined) entries.push(["price_cents", patch.price_cents]);

  for (const [key, value] of entries) {
    await pool.query(
      `insert into settings (key, value, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (key) do update set value = excluded.value, updated_at = now()`,
      [key, JSON.stringify(value)],
    );
  }
  return getSettings();
}

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
}

export async function listPromoCodes(): Promise<PromoCode[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, code, discount_percent, is_active, max_uses, used_count, expires_at, created_at
     from promo_codes
     order by created_at desc`,
  );
  return rows;
}

export async function createPromoCode(input: {
  code: string;
  discount_percent: number;
  is_active?: boolean;
  max_uses?: number | null;
  expires_at?: string | null;
}): Promise<PromoCode> {
  const pool = getPool();
  const code = input.code.trim().toUpperCase();
  const { rows } = await pool.query(
    `insert into promo_codes (code, discount_percent, is_active, max_uses, expires_at)
     values ($1, $2, $3, $4, $5)
     returning id, code, discount_percent, is_active, max_uses, used_count, expires_at, created_at`,
    [
      code,
      input.discount_percent,
      input.is_active ?? true,
      input.max_uses ?? null,
      input.expires_at ?? null,
    ],
  );
  return rows[0];
}

export async function updatePromoCode(
  id: string,
  patch: Partial<{
    discount_percent: number;
    is_active: boolean;
    max_uses: number | null;
    expires_at: string | null;
  }>,
): Promise<PromoCode | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `update promo_codes
     set discount_percent = coalesce($2, discount_percent),
         is_active = coalesce($3, is_active),
         max_uses = $4,
         expires_at = $5
     where id = $1
     returning id, code, discount_percent, is_active, max_uses, used_count, expires_at, created_at`,
    [
      id,
      patch.discount_percent,
      patch.is_active,
      patch.max_uses === undefined ? null : patch.max_uses,
      patch.expires_at === undefined ? null : patch.expires_at,
    ],
  );
  return rows[0] || null;
}

export async function deletePromoCode(id: string) {
  const pool = getPool();
  const { rowCount } = await pool.query(`delete from promo_codes where id = $1`, [id]);
  return rowCount;
}

/**
 * Проверяет промо-код и возвращает размер скидки в процентах.
 * Возвращает null, если код недействителен.
 */
export async function validatePromoCode(code: string): Promise<number | null> {
  const pool = getPool();
  const normalized = code.trim().toUpperCase();
  const { rows } = await pool.query(
    `select discount_percent, is_active, max_uses, used_count, expires_at
     from promo_codes
     where code = $1`,
    [normalized],
  );
  const promo = rows[0];
  if (!promo) return null;
  if (!promo.is_active) return null;
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) return null;
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) return null;
  return Number(promo.discount_percent);
}

/** Увеличивает счётчик использований промо-кода. */
export async function incrementPromoUsage(code: string) {
  const pool = getPool();
  await pool.query(
    `update promo_codes set used_count = used_count + 1 where code = $1`,
    [code.trim().toUpperCase()],
  );
}

// ===== FAQ (блок "Частые вопросы" на главной странице) =====

export interface FaqItem {
  question: string;
  answer: string;
}

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  { question: "Платно ли пройти анализ?", answer: "Нет, на данном этапе сервис доступен бесплатно." },
  { question: "Сколько времени занимает опрос?", answer: "Обычно 10–15 минут — вопросы идут короткими сериями по 3–5 штук." },
  { question: "Можно ли пройти повторно?", answer: "Да, вы можете пройти анализ снова в любой момент, например через несколько месяцев." },
  { question: "Что делать с сохранённым отчётом?", answer: "Отчёт можно скачать в формате PDF или DOCX сразу после прохождения анализа." },
  { question: "Нужна ли регистрация?", answer: "Нет, регистрация не требуется — отчёт формируется сразу после ответов на вопросы." },
];

/** Возвращает список вопросов/ответов FAQ (с дефолтами, если в БД их нет). */
export async function getFaqItems(): Promise<FaqItem[]> {
  const pool = getPool();
  const { rows } = await pool.query(`select value from settings where key = 'faq_items'`);
  const raw = rows[0]?.value;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .filter((item) => item && typeof item.question === "string" && typeof item.answer === "string")
      .map((item) => ({ question: item.question, answer: item.answer }));
  }
  return DEFAULT_FAQ_ITEMS;
}

/** Сохраняет список вопросов/ответов FAQ. */
export async function saveFaqItems(items: FaqItem[]): Promise<FaqItem[]> {
  const pool = getPool();
  const clean = items
    .filter((item) => item && typeof item.question === "string" && typeof item.answer === "string")
    .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }))
    .filter((item) => item.question && item.answer);

  await pool.query(
    `insert into settings (key, value, updated_at)
     values ('faq_items', $1::jsonb, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify(clean)],
  );
  return clean;
}

/**
 * Клиент API ЮKassa (https://yookassa.ru/developers/api).
 * Авторизация: HTTP Basic (shopId : secret_key).
 * Переменные окружения: YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY,
 * опционально YOOKASSA_SEND_RECEIPT=true для чеков по 54-ФЗ.
 */

const API_BASE = "https://api.yookassa.ru/v3";

export type YooKassaStatus = "pending" | "waiting_for_capture" | "succeeded" | "canceled";

export interface YooKassaPayment {
  id: string;
  status: YooKassaStatus | string;
  paid?: boolean;
  amount?: { value: string; currency: string };
  confirmation?: { type?: string; confirmation_url?: string } | null;
  metadata?: Record<string, unknown> | null;
  description?: string;
}

export function isYooKassaConfigured(): boolean {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

function authHeader(): string {
  const shopId = process.env.YOOKASSA_SHOP_ID ?? "";
  const secret = process.env.YOOKASSA_SECRET_KEY ?? "";
  return `Basic ${Buffer.from(`${shopId}:${secret}`).toString("base64")}`;
}

function buildReceipt(amountCents: number, email: string) {
  return {
    customer: { email },
    items: [
      {
        description: "Доступ к профориентационному тесту",
        quantity: "1.00",
        amount: { value: (amountCents / 100).toFixed(2), currency: "RUB" },
        vat_code: 1, // без НДС
        payment_subject: "service",
        payment_mode: "full_payment",
      },
    ],
  };
}

/** Создаёт платёж в ЮKassa и возвращает объект платежа (с confirmation_url). */
export async function createYooKassaPayment(params: {
  amountCents: number;
  description: string;
  returnUrl: string;
  metadata: Record<string, unknown>;
  idempotenceKey: string;
  customerEmail?: string | null;
}): Promise<YooKassaPayment> {
  if (!isYooKassaConfigured()) {
    throw new Error(
      "ЮKassa не настроена: задайте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в .env.local",
    );
  }

  const body: Record<string, unknown> = {
    amount: { value: (params.amountCents / 100).toFixed(2), currency: "RUB" },
    capture: true,
    confirmation: { type: "redirect", return_url: params.returnUrl },
    description: params.description,
    metadata: params.metadata,
  };

  if (process.env.YOOKASSA_SEND_RECEIPT === "true" && params.customerEmail) {
    body.receipt = buildReceipt(params.amountCents, params.customerEmail);
  }

  const response = await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": params.idempotenceKey,
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`ЮKassa вернула некорректный ответ (HTTP ${response.status})`);
  }

  if (!response.ok) {
    const err = data as { description?: string; code?: string };
    throw new Error(err?.description || err?.code || `ЮKassa вернула ошибку ${response.status}`);
  }

  return data as YooKassaPayment;
}

/**
 * Запрашивает платёж из ЮKassa по его id.
 * Используется для надёжной проверки подлинности вебхуков и
 * для синхронизации «зависших» платежей.
 */
export async function fetchYooKassaPayment(paymentId: string): Promise<YooKassaPayment | null> {
  if (!isYooKassaConfigured()) return null;

  const response = await fetch(`${API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authHeader() },
  });

  if (!response.ok) return null;

  try {
    return (await response.json()) as YooKassaPayment;
  } catch {
    return null;
  }
}

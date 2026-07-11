import { REPORT_SYSTEM_PROMPT } from "./systemPrompt";

const COMPLETION_URL =
  "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

interface YandexGptMessage {
  role: "system" | "user" | "assistant";
  text: string;
}

interface YandexGptResponse {
  result: {
    alternatives: Array<{ message: YandexGptMessage; status: string }>;
  };
}

async function completeChat(messages: YandexGptMessage[]): Promise<string> {
  const folderId = process.env.YC_FOLDER_ID;
  const apiKey = process.env.YC_SERVICE_ACCOUNT_SECRET;
  const modelUri =
    process.env.YC_GPT_MODEL_URI ?? `gpt://${folderId}/yandexgpt/latest`;

  if (!folderId || !apiKey) {
    throw new Error(
      "YC_FOLDER_ID / YC_SERVICE_ACCOUNT_SECRET не заданы в переменных окружения",
    );
  }

  const response = await fetch(COMPLETION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${apiKey}`,
      "x-folder-id": folderId,
    },
    body: JSON.stringify({
      modelUri,
      completionOptions: { stream: false, temperature: 0.4, maxTokens: 4000 },
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `YandexGPT API вернул ошибку ${response.status}: ${errorBody}`,
    );
  }

  const data = (await response.json()) as YandexGptResponse;
  const text = data.result?.alternatives?.[0]?.message?.text;

  if (!text) {
    throw new Error("YandexGPT вернул пустой ответ");
  }

  return text;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fencedMatch ? fencedMatch[1] : trimmed;
  return JSON.parse(jsonText);
}

export async function requestCareerAnalysis(
  userPayload: unknown,
): Promise<unknown> {
  const baseMessages: YandexGptMessage[] = [
    { role: "system", text: REPORT_SYSTEM_PROMPT },
    { role: "user", text: JSON.stringify(userPayload) },
  ];

  const firstAttempt = await completeChat(baseMessages);

  try {
    return extractJson(firstAttempt);
  } catch {
    const retryMessages: YandexGptMessage[] = [
      ...baseMessages,
      { role: "assistant", text: firstAttempt },
      {
        role: "user",
        text: "Ответ не является валидным JSON. Верни строго валидный JSON согласно схеме, без markdown-разметки и пояснений.",
      },
    ];
    const secondAttempt = await completeChat(retryMessages);
    return extractJson(secondAttempt);
  }
}

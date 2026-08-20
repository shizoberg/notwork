import type {
  WordcloudAnswer,
  WordcloudEventConfig,
  WordcloudQuestion,
  WordcloudResults,
} from "@/lib/event-wordcloud";

const apiUrl = "/api/events/21-agustos/wordcloud";
const adminUrl = "/api/admin/events/21-agustos/wordcloud";

export type WordcloudBootstrap = {
  event: WordcloudEventConfig;
  questions: WordcloudQuestion[];
  sessionId?: string;
};

export async function getWordcloudBootstrap(sessionId?: string): Promise<WordcloudBootstrap> {
  const search = new URLSearchParams({ action: "bootstrap" });
  if (sessionId) search.set("sessionId", sessionId);
  const response = await fetch(`${apiUrl}?${search}`, { cache: "no-store" });
  if (!response.ok) throw new Error("WordCloud bilgisi alınamadı.");
  return response.json();
}

export async function createWordcloudSession(existingSessionId?: string) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "session", sessionId: existingSessionId }),
  });
  if (!response.ok) throw new Error("Oturum oluşturulamadı.");
  return response.json() as Promise<{ sessionId: string }>;
}

export async function submitWordcloudAnswer(input: {
  sessionId: string;
  questionId: string;
  answer: string;
}) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "answer", ...input }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{ answer: WordcloudAnswer }>;
}

export async function submitWordcloudAnswers(input: {
  sessionId?: string;
  answers: Array<{ questionId: string; answer: string }>;
}) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "submit", ...input }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{ sessionId: string; answers: WordcloudAnswer[] }>;
}

export async function getWordcloudResults(): Promise<WordcloudResults> {
  const response = await fetch(`${apiUrl}?action=results`, { cache: "no-store" });
  if (!response.ok) throw new Error("Sonuçlar alınamadı.");
  return response.json();
}

export async function getWordcloudAdmin(password: string) {
  const response = await fetch(adminUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, action: "list" }),
  });
  if (!response.ok) throw new Error("Admin verisi alınamadı.");
  return response.json() as Promise<{
    event: WordcloudEventConfig;
    questions: WordcloudQuestion[];
    answers: WordcloudAnswer[];
    results: WordcloudResults;
    database?: {
      storeName: string;
      datasetCode: string;
      activeDatabaseCode: string;
      demoDatabaseCode: string;
      liveDatabaseCode: string;
      keyPrefix: string;
      mode: "demo" | "live";
    };
  }>;
}

export async function updateWordcloudAdmin(
  password: string,
  payload:
    | { action: "saveQuestion"; question: Partial<WordcloudQuestion> }
    | { action: "deleteQuestion"; questionId: string }
    | { action: "toggleAnswer"; answerId: string; isVisible: boolean }
    | { action: "updateEvent"; event: Partial<WordcloudEventConfig> }
    | { action: "resetDemo" }
    | { action: "seedLoadTest" },
) {
  const response = await fetch(adminUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, ...payload }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{
    event: WordcloudEventConfig;
    questions: WordcloudQuestion[];
    answers: WordcloudAnswer[];
    results: WordcloudResults;
    database?: {
      storeName: string;
      datasetCode: string;
      activeDatabaseCode: string;
      demoDatabaseCode: string;
      liveDatabaseCode: string;
      keyPrefix: string;
      mode: "demo" | "live";
    };
  }>;
}

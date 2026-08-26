import type {
  WordcloudAnswer,
  WordcloudEventConfig,
  WordcloudQuestion,
  WordcloudResults,
} from "@/lib/event-wordcloud";
import {
  eventSelectionIdentifier,
  getEventSelectionFromLocation,
  type EventSelection,
  withEventSelectionInput,
} from "@/lib/event-registry";

const legacyApiUrl = "/api/events/21-agustos/wordcloud";
const legacyAdminUrl = "/api/admin/events/21-agustos/wordcloud";

function resolvedSelection(selection?: EventSelection) {
  return selection || getEventSelectionFromLocation();
}

function apiUrl(selection: EventSelection) {
  return eventSelectionIdentifier(selection) ? "/api/event-products/wordcloud" : legacyApiUrl;
}

function adminUrl(selection: EventSelection) {
  return eventSelectionIdentifier(selection)
    ? "/api/admin/event-products/wordcloud"
    : legacyAdminUrl;
}

export function getWordcloudSessionStorageKey(selection?: EventSelection) {
  const identifier = eventSelectionIdentifier(resolvedSelection(selection));
  return identifier
    ? `notwork_wordcloud_session:${identifier}`
    : "notwork_21_agustos_wordcloud_session";
}

export function getWordcloudStreamUrl(selection?: EventSelection) {
  const activeSelection = resolvedSelection(selection);
  const identifier = eventSelectionIdentifier(activeSelection);
  return identifier
    ? `/api/event-products/wordcloud/stream?event=${encodeURIComponent(identifier)}`
    : "/api/events/21-agustos/wordcloud/stream";
}

export type WordcloudBootstrap = {
  event: WordcloudEventConfig;
  questions: WordcloudQuestion[];
  sessionId?: string;
};

export type WordcloudAnswerPage = {
  offset: number;
  limit: number;
  total: number;
  visible: number;
  hidden: number;
  hasMore: boolean;
};

export async function getWordcloudBootstrap(
  sessionId?: string,
  selection?: EventSelection,
): Promise<WordcloudBootstrap> {
  const activeSelection = resolvedSelection(selection);
  const search = new URLSearchParams({ action: "bootstrap" });
  if (sessionId) search.set("sessionId", sessionId);
  const identifier = eventSelectionIdentifier(activeSelection);
  if (identifier) search.set("event", identifier);
  const response = await fetch(`${apiUrl(activeSelection)}?${search}`, { cache: "no-store" });
  if (!response.ok) throw new Error("WordCloud bilgisi alınamadı.");
  return response.json();
}

export async function createWordcloudSession(
  existingSessionId?: string,
  selection?: EventSelection,
) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(apiUrl(activeSelection), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      withEventSelectionInput({ action: "session", sessionId: existingSessionId }, activeSelection),
    ),
  });
  if (!response.ok) throw new Error("Oturum oluşturulamadı.");
  return response.json() as Promise<{ sessionId: string }>;
}

export async function submitWordcloudAnswer(
  input: {
    sessionId: string;
    questionId: string;
    answer: string;
  },
  selection?: EventSelection,
) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(apiUrl(activeSelection), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withEventSelectionInput({ action: "answer", ...input }, activeSelection)),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{ answer: WordcloudAnswer }>;
}

export async function submitWordcloudAnswers(
  input: {
    sessionId?: string;
    answers: Array<{ questionId: string; answer: string }>;
  },
  selection?: EventSelection,
) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(apiUrl(activeSelection), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withEventSelectionInput({ action: "submit", ...input }, activeSelection)),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{ sessionId: string; answers: WordcloudAnswer[] }>;
}

export async function getWordcloudResults(selection?: EventSelection): Promise<WordcloudResults> {
  const activeSelection = resolvedSelection(selection);
  const search = new URLSearchParams({ action: "results" });
  const identifier = eventSelectionIdentifier(activeSelection);
  if (identifier) search.set("event", identifier);
  const response = await fetch(`${apiUrl(activeSelection)}?${search}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Sonuçlar alınamadı.");
  return response.json();
}

export async function getWordcloudAdmin(password: string, selection?: EventSelection) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(adminUrl(activeSelection), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withEventSelectionInput({ password, action: "list" }, activeSelection)),
  });
  if (!response.ok) throw new Error("Admin verisi alınamadı.");
  return response.json() as Promise<{
    event: WordcloudEventConfig;
    questions: WordcloudQuestion[];
    answers: WordcloudAnswer[];
    answerPage: WordcloudAnswerPage;
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
  selection?: EventSelection,
) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(adminUrl(activeSelection), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withEventSelectionInput({ password, ...payload }, activeSelection)),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{
    event: WordcloudEventConfig;
    questions: WordcloudQuestion[];
    answers: WordcloudAnswer[];
    answerPage: WordcloudAnswerPage;
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

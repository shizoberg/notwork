import type { Config, Context } from "@netlify/functions";
import {
  answerKey,
  clean,
  ensureSeeded,
  getEventConfig,
  getQuestions,
  getResults,
  getWordcloudStore,
  isBlockedAnswer,
  normalizeText,
  sessionKey,
  type PublicInput,
} from "./_wordcloud-store.mjs";

const eventId = "21-agustos-2026";

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: { "cache-control": "no-store", ...(init?.headers || {}) },
  });
}

async function createSession(
  store: ReturnType<typeof getWordcloudStore>,
  existingSessionId?: string,
) {
  const safeExisting = clean(existingSessionId, 80);
  if (safeExisting) {
    const existing = await store.get(sessionKey(safeExisting), { consistency: "strong" });
    if (existing) return safeExisting;
  }

  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();
  await store.setJSON(sessionKey(sessionId), {
    id: sessionId,
    eventId,
    createdAt: now,
    updatedAt: now,
    source: "participant",
  });
  return sessionId;
}

export default async (request: Request, _context: Context) => {
  const store = getWordcloudStore();
  await ensureSeeded(store);

  if (request.method === "GET") {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "bootstrap";

    if (action === "results") return json(await getResults(store));

    if (action === "bootstrap") {
      const [event, questions] = await Promise.all([getEventConfig(store), getQuestions(store)]);
      return json({
        event,
        questions: questions.filter((question) => question.isActive),
      });
    }

    return new Response("Geçersiz işlem", { status: 400 });
  }

  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (Number(request.headers.get("content-length") || 0) > 4_096) {
    return new Response("Payload too large", { status: 413 });
  }

  try {
    const input = (await request.json()) as PublicInput;
    const action = clean(input.action, 30);

    if (action === "session") {
      const sessionId = await createSession(store, input.sessionId);
      return json({ sessionId }, { status: 201 });
    }

    if (action === "answer") {
      const event = await getEventConfig(store);
      if (!event.isOpen) return new Response("WordCloud şu an kapalı", { status: 403 });

      const sessionId = await createSession(store, input.sessionId);
      const questionId = clean(input.questionId, 40);
      const rawText = clean(input.answer, 60);
      const normalizedText = normalizeText(rawText);
      if (!questionId) return new Response("Soru seçimi gerekli", { status: 400 });
      if (!normalizedText) return new Response("Cevap boş olamaz", { status: 400 });
      if (isBlockedAnswer(rawText, normalizedText)) {
        return new Response("Bu cevap ekrana yansıtılamaz. Lütfen başka bir cevap yaz.", {
          status: 400,
        });
      }

      const questions = await getQuestions(store);
      const question = questions.find((row) => row.id === questionId && row.isActive);
      if (!question) return new Response("Soru aktif değil", { status: 400 });

      const key = answerKey(questionId, sessionId);
      const existing = (await store.get(key, { type: "json", consistency: "strong" })) as {
        id?: string;
        createdAt?: string;
      } | null;
      if (existing && !event.allowEdit) {
        return new Response("Bu soru için cevap zaten gönderildi", { status: 409 });
      }

      const now = new Date().toISOString();
      const answer = {
        id: existing?.id || crypto.randomUUID(),
        eventId,
        questionId,
        sessionId,
        rawText,
        normalizedText,
        isVisible: true,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      await store.setJSON(key, answer);
      return json({ answer }, { status: 201 });
    }

    return new Response("Geçersiz işlem", { status: 400 });
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }
};

export const config: Config = { path: "/api/events/21-agustos/wordcloud" };

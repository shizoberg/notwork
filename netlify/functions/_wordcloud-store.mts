import { getStore } from "@netlify/blobs";
import seedData from "../data/21-agustos-wordcloud-seed.json" with { type: "json" };

type WordcloudQuestion = {
  id: string;
  order: number;
  title: string;
  helper: string;
  isActive: boolean;
  maxAnswersPerSession: number;
  updatedAt: string;
};

type WordcloudEventConfig = {
  eventId: string;
  title: string;
  shortTitle: string;
  isOpen: boolean;
  allowEdit: boolean;
  updatedAt: string;
};

type WordcloudAnswer = {
  id: string;
  eventId: string;
  questionId: string;
  sessionId: string;
  rawText: string;
  normalizedText: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

type SeedData = {
  event: WordcloudEventConfig;
  questions: WordcloudQuestion[];
  answers: Array<{ questionId: string; rawText: string }>;
};

export type AdminInput = {
  password?: string;
  action?: string;
  question?: Partial<WordcloudQuestion>;
  questionId?: string;
  answerId?: string;
  isVisible?: boolean;
  event?: Partial<WordcloudEventConfig>;
};

export type PublicInput = {
  action?: string;
  sessionId?: string;
  questionId?: string;
  answer?: string;
};

const eventId = "21-agustos-2026";
const storeName = "event-wordcloud";
const seededKey = "events/21-agustos/meta/seeded-v1";

export function getWordcloudStore() {
  return getStore({ name: storeName, consistency: "strong" });
}

export function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

export function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[“”"'.!?;:()[\]{}<>/\\|=+*_~`^%$#@]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function isBlockedAnswer(rawText: string, normalizedText = normalizeText(rawText)) {
  const compact = normalizedText.replace(/\s+/g, "");
  const tokenText = ` ${normalizedText} `;
  const blockedPatterns = [
    /(^|\s)s[i1]k\w*(\s|$)/,
    /(^|\s)s[iı1]ç\w*(\s|$)/,
    /(^|\s)(am|amk|amc[iı]k\w*|am[iı]na\w*)(\s|$)/,
    /(^|\s)yar+r+ak\w*(\s|$)/,
    /(^|\s)or[o0]spu\w*(\s|$)/,
    /(^|\s)piç\w*(\s|$)/,
    /(^|\s)g[oö]t\w*(\s|$)/,
  ];
  return blockedPatterns.some((pattern) => pattern.test(tokenText)) || /yar+r+ak/.test(compact);
}

export function questionKey(questionId: string) {
  return `events/21-agustos/questions/${questionId}.json`;
}

export function sessionKey(sessionId: string) {
  return `events/21-agustos/sessions/${sessionId}.json`;
}

export function answerKey(questionId: string, sessionId: string) {
  return `events/21-agustos/answers/${questionId}/${sessionId}.json`;
}

export function adminActionKey() {
  return `events/21-agustos/admin-actions/${Date.now()}-${crypto.randomUUID()}.json`;
}

export async function ensureSeeded(store = getWordcloudStore()) {
  const seeded = await store.get(seededKey, { consistency: "strong" });
  if (seeded) return;

  const seed = seedData as SeedData;
  await store.setJSON("events/21-agustos/config.json", seed.event);
  await Promise.all(
    seed.questions.map((question) => store.setJSON(questionKey(question.id), question)),
  );
  await Promise.all(
    seed.answers.map((answer, index) => {
      const sessionId = `seed-session-${String(index + 1).padStart(2, "0")}`;
      const now = new Date(Date.parse("2026-08-04T00:00:00.000Z") + index * 1000).toISOString();
      const row: WordcloudAnswer = {
        id: crypto.randomUUID(),
        eventId,
        questionId: answer.questionId,
        sessionId,
        rawText: clean(answer.rawText, 60),
        normalizedText: normalizeText(answer.rawText),
        isVisible: true,
        createdAt: now,
        updatedAt: now,
      };
      return Promise.all([
        store.setJSON(sessionKey(sessionId), {
          id: sessionId,
          eventId,
          createdAt: now,
          updatedAt: now,
          source: "seed",
        }),
        store.setJSON(answerKey(row.questionId, sessionId), row),
      ]);
    }),
  );
  await store.set(seededKey, new Date().toISOString());
}

export async function getEventConfig(store = getWordcloudStore()) {
  await ensureSeeded(store);
  return (await store.get("events/21-agustos/config.json", {
    type: "json",
    consistency: "strong",
  })) as WordcloudEventConfig;
}

export async function getQuestions(store = getWordcloudStore()) {
  await ensureSeeded(store);
  const { blobs } = await store.list({ prefix: "events/21-agustos/questions/" });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );
  return (rows.filter(Boolean) as WordcloudQuestion[]).sort(
    (first, second) => first.order - second.order || first.title.localeCompare(second.title, "tr"),
  );
}

export async function getAnswers(store = getWordcloudStore()) {
  await ensureSeeded(store);
  const { blobs } = await store.list({ prefix: "events/21-agustos/answers/" });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );
  return (rows.filter(Boolean) as WordcloudAnswer[]).sort((first, second) =>
    second.updatedAt.localeCompare(first.updatedAt),
  );
}

export async function getResults(store = getWordcloudStore()) {
  const [event, questions, answers] = await Promise.all([
    getEventConfig(store),
    getQuestions(store),
    getAnswers(store),
  ]);
  const visibleAnswers = answers.filter((answer) => answer.isVisible && answer.normalizedText);
  const results: Record<string, Array<{ text: string; count: number; variants: string[] }>> = {};

  for (const question of questions) {
    const grouped = new Map<string, { text: string; count: number; variants: Set<string> }>();
    for (const answer of visibleAnswers.filter((row) => row.questionId === question.id)) {
      const current = grouped.get(answer.normalizedText) || {
        text: answer.normalizedText,
        count: 0,
        variants: new Set<string>(),
      };
      current.count += 1;
      current.variants.add(answer.rawText);
      grouped.set(answer.normalizedText, current);
    }
    results[question.id] = [...grouped.values()]
      .sort(
        (first, second) =>
          second.count - first.count || first.text.localeCompare(second.text, "tr"),
      )
      .slice(0, 80)
      .map((word) => ({
        text: word.text,
        count: word.count,
        variants: [...word.variants].slice(0, 6),
      }));
  }

  return {
    event,
    questions,
    activeQuestionId: questions.find((question) => question.isActive)?.id || questions[0]?.id || "",
    results,
    totalVisibleAnswers: visibleAnswers.length,
    generatedAt: new Date().toISOString(),
  };
}

export async function upsertQuestion(
  store: ReturnType<typeof getWordcloudStore>,
  input: Partial<WordcloudQuestion>,
) {
  const now = new Date().toISOString();
  const id = clean(input.id, 40) || crypto.randomUUID();
  const question: WordcloudQuestion = {
    id,
    order: Math.max(1, Math.min(99, Number(input.order) || 1)),
    title: clean(input.title, 160),
    helper: clean(input.helper, 220),
    isActive: input.isActive !== false,
    maxAnswersPerSession: 1,
    updatedAt: now,
  };
  if (!question.title) throw new Error("Soru başlığı gerekli");
  await store.setJSON(questionKey(id), question);
  return question;
}

export async function logAdminAction(
  store: ReturnType<typeof getWordcloudStore>,
  action: string,
  payload: Record<string, unknown>,
) {
  await store.setJSON(adminActionKey(), {
    id: crypto.randomUUID(),
    action,
    payload,
    createdAt: new Date().toISOString(),
  });
}

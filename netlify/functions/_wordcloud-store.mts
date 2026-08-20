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
const defaultDatasetCode = "21agustos-demo";
const liveDatasetCode = "21agustoscanli";
const datasetCode =
  process.env.WORDCLOUD_DATASET?.trim() ||
  process.env.EVENT_WORDCLOUD_DATASET?.trim() ||
  process.env.NETLIFY_WORDCLOUD_DATASET?.trim() ||
  defaultDatasetCode;
const datasetPrefix = `events/${datasetCode}/wordcloud`;
const seededKey = `${datasetPrefix}/meta/seeded-v2`;

export function getWordcloudStore() {
  return getStore({ name: storeName, consistency: "strong" });
}

export function getWordcloudDatasetInfo() {
  return {
    storeName,
    datasetCode,
    activeDatabaseCode: datasetCode,
    demoDatabaseCode: defaultDatasetCode,
    liveDatabaseCode: liveDatasetCode,
    keyPrefix: datasetPrefix,
    mode: datasetCode === liveDatasetCode ? ("live" as const) : ("demo" as const),
  };
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
  return `${datasetPrefix}/questions/${questionId}.json`;
}

export function sessionKey(sessionId: string) {
  return `${datasetPrefix}/sessions/${sessionId}.json`;
}

export function answerKey(questionId: string, sessionId: string) {
  return `${datasetPrefix}/answers/${questionId}/${sessionId}.json`;
}

export function adminActionKey() {
  return `${datasetPrefix}/admin-actions/${Date.now()}-${crypto.randomUUID()}.json`;
}

function configKey() {
  return `${datasetPrefix}/config.json`;
}

export async function ensureSeeded(store = getWordcloudStore()) {
  const seeded = await store.get(seededKey, { consistency: "strong" });
  if (seeded) return;

  const seed = seedData as SeedData;
  await store.setJSON(configKey(), seed.event);
  await Promise.all(
    seed.questions.map((question) => store.setJSON(questionKey(question.id), question)),
  );
  await store.set(seededKey, new Date().toISOString());
}

export async function resetDemoWordcloudDataset(store = getWordcloudStore()) {
  if (getWordcloudDatasetInfo().mode !== "demo") {
    throw new Error("WordCloud reset sadece demo database üzerinde çalışır");
  }
  const { blobs } = await store.list({ prefix: `${datasetPrefix}/` });
  await Promise.all(blobs.map((blob) => store.delete(blob.key)));
  await ensureSeeded(store);
}

export async function seedWordcloudLoadTest(store = getWordcloudStore(), participantCount = 100) {
  if (getWordcloudDatasetInfo().mode !== "demo") {
    throw new Error("Load test sadece demo database üzerinde çalışır");
  }
  await resetDemoWordcloudDataset(store);
  const questions = await getQuestions(store);
  const answerPools = [
    ["cesaret", "network", "müşteri", "mentor", "pazarlama", "ekip", "fikir", "yatırım"],
    ["iletişim", "odak", "sabır", "hata", "satış", "güven", "disiplin", "merak"],
    ["bağlantı", "ilham", "deneyim", "ortaklık", "hikaye", "sahne", "öğrenme", "topluluk"],
  ];
  const nowMs = Date.now();
  const jobs: Array<Promise<unknown>> = [];

  for (let participantIndex = 0; participantIndex < participantCount; participantIndex += 1) {
    const sessionId = `load-test-${String(participantIndex + 1).padStart(3, "0")}`;
    const now = new Date(nowMs + participantIndex).toISOString();
    jobs.push(
      store.setJSON(sessionKey(sessionId), {
        id: sessionId,
        eventId,
        createdAt: now,
        updatedAt: now,
        source: "load-test",
      }),
    );
    questions.forEach((question, questionIndex) => {
      const pool = answerPools[questionIndex % answerPools.length];
      const rawText = pool[(participantIndex + questionIndex * 3) % pool.length];
      const answer: WordcloudAnswer = {
        id: crypto.randomUUID(),
        eventId,
        questionId: question.id,
        sessionId,
        rawText,
        normalizedText: normalizeText(rawText),
        isVisible: true,
        createdAt: now,
        updatedAt: now,
      };
      jobs.push(store.setJSON(answerKey(question.id, sessionId), answer));
    });
  }

  await Promise.all(jobs);
  await logAdminAction(store, "seedLoadTest", { participantCount, questions: questions.length });
  return getResults(store);
}

export async function getEventConfig(store = getWordcloudStore()) {
  await ensureSeeded(store);
  return (await store.get(configKey(), {
    type: "json",
    consistency: "strong",
  })) as WordcloudEventConfig;
}

export async function getQuestions(store = getWordcloudStore()) {
  await ensureSeeded(store);
  const { blobs } = await store.list({ prefix: `${datasetPrefix}/questions/` });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );
  return (rows.filter(Boolean) as WordcloudQuestion[]).sort(
    (first, second) => first.order - second.order || first.title.localeCompare(second.title, "tr"),
  );
}

export async function getAnswers(store = getWordcloudStore()) {
  await ensureSeeded(store);
  const { blobs } = await store.list({ prefix: `${datasetPrefix}/answers/` });
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

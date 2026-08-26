import { createHash, timingSafeEqual } from "node:crypto";
import type { Config, Context } from "@netlify/functions";
import {
  buildWordcloudResults,
  clean,
  ensureSeeded,
  getAnswers,
  getEventConfig,
  getQuestions,
  getWordcloudDatasetInfo,
  getWordcloudStore,
  logAdminAction,
  questionKey,
  resetDemoWordcloudDataset,
  seedWordcloudLoadTest,
  upsertQuestion,
  type AdminInput,
} from "./_wordcloud-store.mjs";
import {
  eventIdentifierFromRequest,
  runWithEventRequestContext,
} from "./_event-product-context.mjs";

const passwordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";

function validPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(passwordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function adminPayload(
  store: ReturnType<typeof getWordcloudStore>,
  input: Pick<AdminInput, "answerLimit" | "answerOffset"> = {},
) {
  const [event, questions, answers] = await Promise.all([
    getEventConfig(store),
    getQuestions(store),
    getAnswers(store),
  ]);
  const results = buildWordcloudResults(event, questions, answers);
  const answerLimit = Math.max(1, Math.min(160, Number(input.answerLimit) || 80));
  const answerOffset = Math.max(0, Number(input.answerOffset) || 0);
  const visibleAnswerCount = answers.filter((answer) => answer.isVisible).length;
  return {
    event,
    questions,
    answers: answers.slice(answerOffset, answerOffset + answerLimit),
    answerPage: {
      offset: answerOffset,
      limit: answerLimit,
      total: answers.length,
      visible: visibleAnswerCount,
      hidden: answers.length - visibleAnswerCount,
      hasMore: answerOffset + answerLimit < answers.length,
    },
    results,
    database: getWordcloudDatasetInfo(),
  };
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const input = (await request.json()) as AdminInput;
    if (!validPassword(input.password)) return new Response("Yetkisiz erişim", { status: 401 });
    const eventIdentifier = eventIdentifierFromRequest(request, input);
    return runWithEventRequestContext(
      eventIdentifier,
      "wordcloud",
      async () => {
        const store = getWordcloudStore();
        await ensureSeeded(store);
        const action = clean(input.action, 40) || "list";

        if (action === "list") {
          return Response.json(await adminPayload(store, input), {
            headers: { "cache-control": "no-store, private" },
          });
        }

        if (action === "updateEvent") {
          const current = await getEventConfig(store);
          const now = new Date().toISOString();
          const event = {
            ...current,
            title: clean(input.event?.title, 120) || current.title,
            shortTitle: clean(input.event?.shortTitle, 60) || current.shortTitle,
            isOpen: typeof input.event?.isOpen === "boolean" ? input.event.isOpen : current.isOpen,
            allowEdit:
              typeof input.event?.allowEdit === "boolean"
                ? input.event.allowEdit
                : current.allowEdit,
            updatedAt: now,
          };
          await Promise.all([
            store.setJSON(`${getWordcloudDatasetInfo().keyPrefix}/config.json`, event),
            logAdminAction(store, action, { event }),
          ]);
          return Response.json(await adminPayload(store, input), {
            headers: { "cache-control": "no-store, private" },
          });
        }

        if (action === "saveQuestion") {
          const question = await upsertQuestion(store, input.question || {});
          await logAdminAction(store, action, { questionId: question.id });
          return Response.json(await adminPayload(store, input), {
            headers: { "cache-control": "no-store, private" },
          });
        }

        if (action === "deleteQuestion") {
          const questionId = clean(input.questionId, 40);
          if (!questionId) return new Response("Soru seçimi gerekli", { status: 400 });
          await Promise.all([
            store.delete(questionKey(questionId)),
            logAdminAction(store, action, { questionId }),
          ]);
          return Response.json(await adminPayload(store, input), {
            headers: { "cache-control": "no-store, private" },
          });
        }

        if (action === "toggleAnswer") {
          const answerId = clean(input.answerId, 80);
          if (!answerId) return new Response("Cevap seçimi gerekli", { status: 400 });
          const answers = await getAnswers(store);
          const answer = answers.find((row) => row.id === answerId);
          if (!answer) return new Response("Cevap bulunamadı", { status: 404 });
          const updated = {
            ...answer,
            isVisible: Boolean(input.isVisible),
            updatedAt: new Date().toISOString(),
          };
          await Promise.all([
            store.setJSON(
              `${getWordcloudDatasetInfo().keyPrefix}/answers/${updated.questionId}/${updated.sessionId}.json`,
              updated,
            ),
            logAdminAction(store, action, { answerId, isVisible: updated.isVisible }),
          ]);
          return Response.json(await adminPayload(store, input), {
            headers: { "cache-control": "no-store, private" },
          });
        }

        if (action === "resetDemo") {
          await resetDemoWordcloudDataset(store);
          await logAdminAction(store, action, {});
          return Response.json(await adminPayload(store, input), {
            headers: { "cache-control": "no-store, private" },
          });
        }

        if (action === "seedLoadTest") {
          await seedWordcloudLoadTest(store, 100);
          return Response.json(await adminPayload(store, input), {
            headers: { "cache-control": "no-store, private" },
          });
        }

        return new Response("Geçersiz işlem", { status: 400 });
      },
      { allowDisabled: true, allowHidden: true, modeOverride: input.mode },
    );
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "İşlem yapılamadı", {
      status: 400,
    });
  }
};

export const config: Config = {
  path: ["/api/admin/events/21-agustos/wordcloud", "/api/admin/event-products/wordcloud"],
};

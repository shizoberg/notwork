import { hasLaunchSession } from "./_launch-admin-auth.mjs";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";
import { atomicState, readAtomicState } from "./_atomic-state.mjs";
import {
  eventIdentifierFromRequest,
  runWithEventRequestContext,
  getEventProductRuntimeContext,
} from "./_event-product-context.mjs";
import { launchPollKey } from "./_launch-datasets.mjs";
import type { LaunchAnnouncement } from "../../src/lib/launch-dataset.ts";
import { getEventNetworkStore, getRegistrationByToken } from "./_event-network-store.mjs";
import {
  defaultPollQuestions,
  launchCompanyQuestions,
  novemberEventSlug,
  type PollConfig,
  type PollQuestion,
} from "../../src/lib/event-poll.ts";

type Vote = { config: PollConfig; ballots: Record<string, string[]> };
type State = Vote & {
  announcement?: LaunchAnnouncement;
  previousPolls?: (Vote & { id: string })[];
};
function upgradeUnansweredLaunchPoll(state: State, launch: boolean) {
  const question = state.config.questions[0];
  const placeholders = ["Firma bir", "Firma iki", "Firma üç", "Firma dört", "Firma beş"];
  if (
    launch && !Object.keys(state.ballots).length && state.config.questions.length === 1 &&
    question?.id === "q1" && question.options.length === placeholders.length &&
    placeholders.every((option, index) => question.options[index] === option)
  ) {
    state.config.questions = [{ ...question, options: launchCompanyQuestions[0].options }];
  }
}
const adminActions = ["admin", "configure", "open", "publish", "reset", "newPoll", "announce"];
const mutations = ["configure", "open", "publish", "reset", "submit", "newPoll", "announce"];

function resultsFor(vote: Vote) {
  const answers = Object.values(vote.ballots);
  return vote.config.questions.map((question, index) => ({
    question,
    total: answers.length,
    counts: question.options.map((label) => ({
      label,
      count: answers.filter((ballot) => ballot[index] === label).length,
    })),
  }));
}
const initial = (launch: boolean): State => ({
  config: {
    revision: 1,
    questionVersion: 1,
    isOpen: launch,
    publishedQuestion: null,
    questions: launch ? launchCompanyQuestions : defaultPollQuestions,
  },
  ballots: {},
});
function isAdmin(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(
    process.env.ADMIN_PASSWORD_HASH ||
      "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee",
  );
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
function questions(value: unknown, launch: boolean): PollQuestion[] {
  if (!Array.isArray(value) || value.length > 5 || value.length < (launch ? 1 : 5))
    throw Error(launch ? "1–5 soru ekle" : "Tam 5 soru gerekli");
  const result = value.map((q, i) => {
    if (
      !q ||
      typeof q.title !== "string" ||
      !q.title.trim() ||
      q.title.length > 180 ||
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      q.options.length > 8 ||
      q.options.some((o: unknown) => typeof o !== "string" || !o.trim() || o.length > 80)
    )
      throw Error("Her soruya 2–8 geçerli seçenek ekle");
    const options = q.options.map((o: string) => o.trim());
    if (new Set(options).size !== options.length) throw Error("Seçenekler farklı olmalı");
    return { id: `q${i + 1}`, title: q.title.trim(), options };
  });
  return result;
}
export default async (request: Request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return new Response("Geçersiz kaynak", { status: 403 });
  const raw = await request.text();
  if (raw.length > 24_000) return new Response("İstek çok büyük", { status: 413 });
  try {
    const input = JSON.parse(raw);
    const event = eventIdentifierFromRequest(request, input);
    if (!event) return new Response("Etkinlik gerekli", { status: 400 });
    const action = input.action || "status";
    const admin = adminActions.includes(action);
    if (admin && !isAdmin(input.password) && !(await hasLaunchSession(request, event)))
      return new Response("Yetkisiz erişim", { status: 401 });
    return await runWithEventRequestContext(
      event,
      "matchlab",
      async () => {
        const context = getEventProductRuntimeContext("matchlab")!;
        if (input.datasetId && input.datasetId !== context.datasetId)
          return new Response("Veri seti değişti. Sayfayı yenile.", { status: 409 });
        if (
          action === "submit" &&
          (!context.event.entry.isOpen || ["completed", "archived"].includes(context.event.status))
        )
          return new Response("Bu etkinlikte yanıt alımı kapalı", { status: 403 });
        const store = getStore({ name: "event-network", consistency: "strong" });
        const launch = context.event.slug === novemberEventSlug;
        if (["newPoll", "announce"].includes(action) && !launch)
          return new Response("Bu işlem yalnızca launchspace için kullanılabilir.", {
            status: 400,
          });
        const key = launch
          ? launchPollKey(context.keyPrefix)
          : `${context.keyPrefix}/poll/state.json`;
        const initialState = () => initial(launch);
        let participantId = "";
        if (input.accessToken) {
          const registration = await getRegistrationByToken(
            getEventNetworkStore(),
            String(input.accessToken),
          );
          if (!registration || registration.participant.status !== "registered")
            return new Response("Etkinlik oturumu bulunamadı", { status: 401 });
          participantId = registration.participant.id;
        }
        if (action === "submit" && !participantId)
          return new Response("Önce etkinliğe giriş yap", { status: 401 });
        if (!["status", "stage", "submit", ...adminActions].includes(action))
          return new Response("Geçersiz işlem", { status: 400 });
        if (mutations.includes(action)) {
          await atomicState<State, void>(store, key, initialState, (state) => {
            upgradeUnansweredLaunchPoll(state, launch);
            if (
              action !== "submit" &&
              action !== "announce" &&
              input.revision !== state.config.revision
            )
              throw Error("Anket değişti, yenile ve tekrar dene");
            if (action === "submit") {
              if (input.questionVersion !== (state.config.questionVersion || 1))
                throw Error("Anket soruları güncellendi, soruları yenile");
              if (!launch && state.ballots[participantId]) return;
              if (!launch && !state.config.isOpen) throw Error("Anket henüz açık değil");
              if (
                !Array.isArray(input.answers) ||
                input.answers.length !== state.config.questions.length ||
                input.answers.some(
                  (a: unknown, i: number) =>
                    typeof a !== "string" || !state.config.questions[i].options.includes(a),
                )
              )
                throw Error("Her soruyu geçerli bir seçenekle cevapla");
              if (!state.ballots[participantId] && Object.keys(state.ballots).length >= 2000) throw Error("Anket kapasitesi doldu");
              state.ballots[participantId] = input.answers;
            } else {
              if (action === "announce") {
                if (typeof input.text !== "string" || input.text.trim().length > 300)
                  throw Error("Duyuru en fazla 300 karakter olabilir.");
                const text = input.text.trim();
                if (text)
                  state.announcement = {
                    id: randomUUID(),
                    text,
                    publishedAt: new Date().toISOString(),
                  };
                else delete state.announcement;
                return;
              }
              if (action === "newPoll") {
                const next = questions(input.questions, true);
                const archive = state.previousPolls ?? [];
                if (archive.length >= 20)
                  throw Error("Bu veri setinde 20 önceki oylama saklanabilir.");
                state.previousPolls = [
                  ...archive,
                  {
                    id: randomUUID(),
                    config: { ...state.config, isOpen: false },
                    ballots: state.ballots,
                  },
                ];
                state.ballots = {};
                state.config = {
                  ...state.config,
                  isOpen: true,
                  publishedQuestion: null,
                  questionVersion: (state.config.questionVersion || 1) + 1,
                  questions: next,
                };
              }
              if (action === "configure") {
                if (Object.keys(state.ballots).length)
                  throw Error("Cevaplar geldikten sonra sorular değiştirilemez");
                state.config.questions = questions(input.questions, launch);
                state.config.publishedQuestion = null;
                state.config.questionVersion = (state.config.questionVersion || 1) + 1;
              }
              if (action === "open") state.config.isOpen = input.isOpen === true;
              if (action === "publish") {
                if (
                  input.questionIndex !== null &&
                  (!Number.isInteger(input.questionIndex) ||
                    input.questionIndex < 0 ||
                    input.questionIndex >= state.config.questions.length)
                )
                  throw Error("Geçersiz soru");
                state.config.publishedQuestion = input.questionIndex;
              }
              if (action === "reset") {
                if (context.mode !== "demo") throw Error("Canlı cevaplar sıfırlanamaz");
                state.ballots = {};
                state.config.questionVersion = (state.config.questionVersion || 1) + 1;
                state.config.isOpen = false;
                state.config.publishedQuestion = null;
              }
              state.config.revision++;
            }
          });
        }
        const state = await readAtomicState<State>(store, key, initialState);
        upgradeUnansweredLaunchPoll(state, launch);
        state.config.questionVersion ||= 1;
        const total = Object.keys(state.ballots).length;
        const results = resultsFor(state);
        const published =
          state.config.publishedQuestion === null ? null : results[state.config.publishedQuestion];
        return Response.json(
          {
            config: launch ? { ...state.config, isOpen: true } : state.config,
            total,
            ...(participantId ? { submitted: Boolean(state.ballots[participantId]), ...(launch ? { myAnswers: state.ballots[participantId] } : {}) } : {}),
            ...(admin ? { results } : { published }),
            ...(admin && launch
              ? {
                  announcement: state.announcement ?? null,
                  previousPolls: (state.previousPolls ?? []).map((vote) => ({
                    id: vote.id,
                    title: vote.config.questions[0].title,
                    total: Object.keys(vote.ballots).length,
                    results: resultsFor(vote),
                  })),
                }
              : {}),
            database: {
              eventId: context.eventId,
              mode: context.mode,
              datasetId: context.datasetId,
              keyPrefix: `${context.keyPrefix}/poll`,
            },
          },
          { headers: { "cache-control": "no-store" } },
        );
      },
      { allowDisabled: true, allowHidden: true },
    );
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Anket işlemi başarısız", {
      status: 400,
    });
  }
};
export const config: Config = { path: "/api/event-products/poll" };

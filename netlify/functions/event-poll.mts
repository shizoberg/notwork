import { hasLaunchSession } from "./_launch-admin-auth.mjs";
import { createHash, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";
import { atomicState, readAtomicState } from "./_atomic-state.mjs";
import {
  eventIdentifierFromRequest,
  runWithEventRequestContext,
  getEventProductRuntimeContext,
} from "./_event-product-context.mjs";
import { getEventNetworkStore, getRegistrationByToken } from "./_event-network-store.mjs";
import {
  defaultPollQuestions,
  type PollConfig,
  type PollQuestion,
} from "../../src/lib/event-poll.ts";

type State = { config: PollConfig; ballots: Record<string, string[]> };
const initial = (): State => ({
  config: {
    revision: 1,
    questionVersion: 1,
    isOpen: false,
    publishedQuestion: null,
    questions: defaultPollQuestions,
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
function questions(value: unknown): PollQuestion[] {
  if (!Array.isArray(value) || value.length !== 5) throw Error("Tam 5 soru gerekli");
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
    const admin = ["admin", "configure", "open", "publish", "reset"].includes(action);
    if (admin && !isAdmin(input.password) && !(await hasLaunchSession(request, event)))
      return new Response("Yetkisiz erişim", { status: 401 });
    return await runWithEventRequestContext(
      event,
      "matchlab",
      async () => {
        const context = getEventProductRuntimeContext("matchlab")!;
        if (
          action === "submit" &&
          (!context.event.entry.isOpen || ["completed", "archived"].includes(context.event.status))
        )
          return new Response("Bu etkinlikte yanıt alımı kapalı", { status: 403 });
        const store = getStore({ name: "event-network", consistency: "strong" });
        const key = `${context.keyPrefix}/poll/state.json`;
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
        if (
          !["status", "stage", "submit", "admin", "configure", "open", "publish", "reset"].includes(
            action,
          )
        )
          return new Response("Geçersiz işlem", { status: 400 });
        if (["configure", "open", "publish", "reset", "submit"].includes(action)) {
          await atomicState<State, void>(store, key, initial, (state) => {
            if (action !== "submit" && input.revision !== state.config.revision)
              throw Error("Anket değişti, yenile ve tekrar dene");
            if (action === "submit") {
              if (state.ballots[participantId]) return;
              if (!state.config.isOpen) throw Error("Anket henüz açık değil");
              if (input.questionVersion !== (state.config.questionVersion || 1))
                throw Error("Anket soruları güncellendi, soruları yenile");
              if (
                !Array.isArray(input.answers) ||
                input.answers.length !== 5 ||
                input.answers.some(
                  (a: unknown, i: number) =>
                    typeof a !== "string" || !state.config.questions[i].options.includes(a),
                )
              )
                throw Error("Beş soruyu da geçerli seçeneklerle cevapla");
              if (Object.keys(state.ballots).length >= 2000) throw Error("Anket kapasitesi doldu");
              state.ballots[participantId] = input.answers;
            } else {
              if (action === "configure") {
                if (Object.keys(state.ballots).length)
                  throw Error("Cevaplar geldikten sonra sorular değiştirilemez");
                state.config.questions = questions(input.questions);
                state.config.questionVersion = (state.config.questionVersion || 1) + 1;
              }
              if (action === "open") state.config.isOpen = input.isOpen === true;
              if (action === "publish") {
                if (
                  input.questionIndex !== null &&
                  (!Number.isInteger(input.questionIndex) ||
                    input.questionIndex < 0 ||
                    input.questionIndex >= 5)
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
        const state = await readAtomicState<State>(store, key, initial);
        state.config.questionVersion ||= 1;
        const total = Object.keys(state.ballots).length;
        const results = state.config.questions.map((question, index) => ({
          question,
          total,
          counts: question.options.map((label) => ({
            label,
            count: Object.values(state.ballots).filter((answers) => answers[index] === label)
              .length,
          })),
        }));
        const published =
          state.config.publishedQuestion === null ? null : results[state.config.publishedQuestion];
        return Response.json(
          {
            config: state.config,
            total,
            ...(participantId ? { submitted: Boolean(state.ballots[participantId]) } : {}),
            ...(admin ? { results } : { published }),
            database: {
              eventId: context.eventId,
              mode: context.mode,
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

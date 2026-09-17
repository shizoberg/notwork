import { createHash } from "node:crypto";
import { atomicState } from "./_atomic-state.mjs";
import { getEventReviewStore } from "./_event-review-store.mjs";
import {
  emptyTables,
  joinTable,
  memberTable,
  publishTableOutcome,
  tableAction,
  tableChat,
  tableOutcome,
  type TableState,
} from "../../src/lib/five-table-model.js";
import {
  getFiveStore,
  getFivePrefix,
  getFiveLiveBoard,
  getFiveMyState,
  getFiveEventReviewMeta,
  type FiveIdentity,
} from "./_five-store.mjs";
import { generateFiveAnalysis } from "./_ntw-ai.mjs";

type FiveTablePhoto = {
  photo: string;
  personId: string;
  consentAt: string;
};

async function saveFiveTableReview(
  fiveStore: ReturnType<typeof getFiveStore>,
  identity: FiveIdentity,
  table: ReturnType<typeof tableOutcome>,
) {
  const outcome = table.outcomes?.[identity.id];
  if (!outcome) throw new Error("Masa değerlendirmesi bulunamadı");
  const event = getFiveEventReviewMeta();
  const photo =
    table.photoOwner === identity.id
      ? ((await fiveStore.get(`${getFivePrefix()}/table-photos/${table.id}.json`, {
          type: "json",
          consistency: "strong",
        })) as FiveTablePhoto | null)
      : null;
  const reviewKey = createHash("sha256")
    .update(`${event.eventId}:${table.id}:${identity.id}`)
    .digest("hex");
  const createdAt = new Date(outcome.at).toISOString();
  await getEventReviewStore().setJSON(
    `reviews/${event.eventId}/five-${reviewKey}.json`,
    {
      id: `five-${reviewKey}`,
      eventId: event.eventId,
      eventTitle: event.eventTitle,
      name: identity.name || "notwork katılımcısı",
      rating: outcome.rating,
      comment: outcome.comment,
      photoDataUrl: photo?.photo || "",
      privateNote: `ntw.five · grup ${table.code} · ${outcome.solved ? "çözüldü" : "devam ediyor"} · çözüm: ${outcome.solution}`,
      consentAt: new Date(outcome.consentAt).toISOString(),
      createdAt,
    },
    { onlyIfNew: true },
  );
}
export async function hasFiveTable(identityId: string) {
  const state = (await getFiveStore().get(`${getFivePrefix()}/tables-v1.json`, {
    type: "json",
    consistency: "strong",
  })) as TableState | null;
  return Boolean(state?.members[identityId]);
}

export async function fiveTables(
  identity: FiveIdentity,
  input: {
    action?: string;
    problemId?: string;
    tableId?: string;
    round?: number;
    photoDataUrl?: string;
    consent?: boolean;
    messageId?: string;
    text?: string;
    solved?: boolean;
    solution?: string;
    rating?: number;
    comment?: string;
    reviewConsent?: boolean;
  },
) {
  const store = getFiveStore();
  const key = `${getFivePrefix()}/tables-v1.json`;
  const action = input.action;
  if (action === "tableJoin") {
    const previous = await getFiveMyState(identity);
    if (previous.activeEncounter && ["waiting", "active"].includes(previous.activeEncounter.status))
      throw new Error("Önce önceki Five görüşmeni tamamla.");
    const board = await getFiveLiveBoard(identity);
    const problem = board.find((p) => p.id === input.problemId);
    if (!problem) throw new Error("Bu problem artık açık değil.");
    const joinedTable = await atomicState(store, key, emptyTables, (state) =>
      joinTable(
        state,
        {
          id: identity.id,
          name: identity.name,
          code: identity.publicCode,
          problem: identity.matchingProfile.needs || problem.title,
          offers: identity.matchingProfile.offers,
          offersDetail: identity.matchingProfile.offersDetail,
          needs: identity.matchingProfile.needs,
          aiAnalysisConsent: identity.aiAnalysisConsent,
        },
        problem,
      ),
    );
    if (
      joinedTable.phase === "ready" &&
      !joinedTable.aiAnalysis &&
      problem.aiAnalysisConsent === true &&
      joinedTable.people.every((person) => person.aiAnalysisConsent === true)
    ) {
      const analysis = await generateFiveAnalysis(getFivePrefix(), problem, joinedTable.people);
      if (analysis) {
        try {
          await atomicState(store, key, emptyTables, (state) => {
            if (state.tables[joinedTable.id] && !state.tables[joinedTable.id].aiAnalysis)
              state.tables[joinedTable.id].aiAnalysis = analysis;
          });
        } catch (error) {
          console.error("Five AI analizi kaydedilemedi", error);
        }
      }
    }
  } else if (action === "tableChat") {
    await atomicState(store, key, emptyTables, (state) =>
      tableChat(state, identity.id, input.tableId || "", input.messageId || "", input.text || "", Date.now()),
    );
  } else if (action === "tableOutcome") {
    if (typeof input.solved !== "boolean") throw new Error("Çözüm durumu gerekli");
    const table = await atomicState(store, key, emptyTables, (state) =>
      tableOutcome(
        state,
        identity.id,
        input.tableId || "",
        input.solved!,
        input.solution || "",
        Number(input.rating),
        input.comment || "",
        input.reviewConsent === true,
        Date.now(),
      ),
    );
    await saveFiveTableReview(store, identity, table);
    await atomicState(store, key, emptyTables, (state) =>
      publishTableOutcome(state, identity.id, input.tableId || "", Date.now()),
    );
  } else if (action && action !== "tableState") {
    const operation = (
      { tableStart: "start", tableNext: "next", tableLeave: "leave", tablePhoto: "photo" } as const
    )[action as "tableStart" | "tableNext" | "tableLeave" | "tablePhoto"];
    if (!operation) throw new Error("Geçersiz masa işlemi");
    if (operation === "photo") {
      const photo = input.photoDataUrl || "";
      if (
        !input.consent ||
        photo.length > 1100000 ||
        !/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(photo)
      )
        throw new Error("Fotoğraf ve saklama izni gerekli.");
      const snapshot = (await store.get(key, {
        type: "json",
        consistency: "strong",
      })) as TableState | null;
      if (!snapshot) throw new Error("Masa bulunamadı");
      tableAction(
        structuredClone(snapshot),
        identity.id,
        input.tableId || "",
        operation,
        Date.now(),
        Number(input.round),
      );
      // Private event storage: never publish these photographs automatically.
      await store.setJSON(
        `${getFivePrefix()}/table-photos/${input.tableId}.json`,
        { photo, personId: identity.id, consentAt: new Date().toISOString() },
        { onlyIfNew: true },
      );
    }
    await atomicState(store, key, emptyTables, (state) =>
      tableAction(
        state,
        identity.id,
        input.tableId || "",
        operation,
        Date.now(),
        Number(input.round),
      ),
    );
  }
  const state =
    ((await store.get(key, { type: "json", consistency: "strong" })) as TableState | null) ||
    emptyTables();
  const board = (await getFiveLiveBoard(identity))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
    }));
  return {
    identity: { id: identity.id, name: identity.name, code: identity.publicCode },
    board,
    table: state.tables[state.members[identity.id]] || null,
    serverNow: Date.now(),
  };
}

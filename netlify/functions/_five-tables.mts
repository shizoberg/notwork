import { atomicState } from "./_atomic-state.mjs";
import {
  emptyTables,
  joinTable,
  memberTable,
  tableAction,
  type TableState,
} from "../../src/lib/five-table-model.js";
import {
  getFiveStore,
  getFivePrefix,
  getFiveLiveBoard,
  getFiveMyState,
  type FiveIdentity,
} from "./_five-store.mjs";
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
    await atomicState(store, key, emptyTables, (state) =>
      joinTable(
        state,
        {
          id: identity.id,
          name: identity.name,
          code: identity.publicCode,
          problem: identity.matchingProfile.needs || problem.title,
        },
        problem,
      ),
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

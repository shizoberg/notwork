import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyTables,
  joinTable,
  tableAction,
  type TableState,
} from "../src/lib/five-table-model.ts";
import { atomicState } from "../netlify/functions/_atomic-state.mts";
const person = (i: number) => ({
  id: String(i),
  name: `Person ${i}`,
  code: `P${i}`,
  problem: `Problem ${i}`,
});
test("four seats, persisted code, authoritative timer, one photo owner, four rounds and stale actions", () => {
  const s = emptyTables();
  for (let i = 0; i < 4; i++) joinTable(s, person(i), { id: "p", title: "Problem" });
  const room = s.tables[s.members["0"]];
  assert.equal(room.people.length, 4);
  assert.equal(room.phase, "ready");
  assert.equal(joinTable(s, person(0), { id: "p", title: "Problem" }).code, room.code);
  assert.throws(() => joinTable(s, person(0), { id: "other", title: "Other" }));
  const other = joinTable(s, person(4), { id: "p", title: "Problem" });
  assert.notEqual(other.id, room.id);
  tableAction(s, "0", room.id, "start", 1000, 0);
  assert.equal(room.endsAt, 301000);
  tableAction(s, "1", room.id, "start", 2000, 0);
  assert.equal(room.endsAt, 301000);
  assert.throws(() => tableAction(s, "0", room.id, "next", 1001, 0));
  assert.throws(() => tableAction(s, "1", room.id, "photo", 301001, 0));
  tableAction(s, "0", room.id, "photo", 301001, 0);
  assert.equal(room.photoSaved, true);
  for (let i = 0; i < 4; i++) tableAction(s, "0", room.id, "next", room.endsAt + 1, i);
  assert.equal(room.phase, "finished");
  const restored = structuredClone(s);
  assert.equal(restored.tables[restored.members["0"]].code, room.code);
  tableAction(s, "0", room.id, "leave", 900000, 3);
  const fresh = joinTable(s, person(0), { id: "other", title: "Other" });
  assert.throws(() => tableAction(s, "0", room.id, "leave", 900001, 3));
  assert.equal(s.members["0"], fresh.id);
});
test("100 simultaneous participants with real compare-and-swap retries never exceed four seats or duplicate membership", async () => {
  let data: TableState | null = null,
    etag = 0,
    conflicts = 0;
  const store = {
    async getWithMetadata() {
      await new Promise((r) => setTimeout(r, Math.random() * 3));
      return data ? { data: structuredClone(data), etag: String(etag) } : null;
    },
    async setJSON(_key: string, next: TableState, options: any) {
      await new Promise((r) => setTimeout(r, Math.random() * 3));
      if (
        (options.onlyIfNew && data) ||
        (options.onlyIfMatch && options.onlyIfMatch !== String(etag))
      ) {
        conflicts++;
        return { modified: false };
      }
      data = structuredClone(next);
      etag++;
      return { modified: true };
    },
  };
  for (let wave = 0; wave < 5; wave++) {
    await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        atomicState(store, "tables", emptyTables, (s) =>
          joinTable(s, person(i), { id: `p${i % 5}`, title: "Demo problem" }),
        ),
      ),
    );
    const state = data! as TableState;
    assert.equal(Object.keys(state.members).length, 100);
    assert.ok(Object.values(state.tables).every((t) => t.people.length <= 4));
    assert.equal(
      new Set(Object.values(state.tables).flatMap((t) => t.people.map((p) => p.id))).size,
      100,
    );
    await Promise.all(
      Array.from({ length: 100 }, (_, i) => {
        const id = state.members[String(i)];
        return atomicState(store, "tables", emptyTables, (s) =>
          tableAction(s, String(i), id, "leave", Date.now(), 0),
        );
      }),
    );
    assert.equal(Object.keys((data! as TableState).members).length, 0);
  }
  assert.ok(conflicts > 0);
  console.log(JSON.stringify({ participants: 100, operations: 1000, conflictsHandled: conflicts }));
});

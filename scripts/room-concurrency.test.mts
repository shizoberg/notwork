import { test } from "node:test";
import assert from "node:assert/strict";
import {
  atomicState,
  emptyRooms,
  claimRoom,
  releaseRoom,
  type RoomIndex,
} from "../netlify/functions/_atomic-state.mts";
type Room = { id: string; participantIds: string[] };
class Store {
  rows = new Map<string, { data: unknown; etag: string }>();
  counter = 0;
  conflicts = 0;
  async getWithMetadata(key: string) {
    await new Promise((r) => setTimeout(r, Math.random() * 3));
    return structuredClone(this.rows.get(key) || null);
  }
  async setJSON(key: string, data: unknown, options: any) {
    await new Promise((r) => setTimeout(r, Math.random() * 3));
    const old = this.rows.get(key);
    if ((options.onlyIfNew && old) || (options.onlyIfMatch && old?.etag !== options.onlyIfMatch)) {
      this.conflicts++;
      return { modified: false };
    }
    this.rows.set(key, { data: structuredClone(data), etag: String(++this.counter) });
    return { modified: true };
  }
}
test("100 participants: concurrent claims, exits, retries and stale exits preserve single membership", async () => {
  const store = new Store();
  let actions = 0;
  const run = (fn: (s: RoomIndex<Room>) => unknown) => {
    actions++;
    return atomicState(store, "rooms", emptyRooms<Room>, fn);
  };
  for (let wave = 0; wave < 10; wave++) {
    await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        run((s) =>
          claimRoom(s, {
            id: `${wave}-${i}`,
            participantIds: [i, (i + 1) % 100, (i + 2) % 100].map(String),
          }),
        ),
      ),
    );
    const before = (await store.getWithMetadata("rooms"))!.data as RoomIndex<Room>;
    const occupants = Object.values(before.groups).flatMap((g) => g.participantIds);
    assert.equal(new Set(occupants).size, occupants.length);
    assert.ok(Object.values(before.groups).every((g) => g.participantIds.length === 3));
    await Promise.all(
      Object.values(before.groups).flatMap((g) =>
        g.participantIds.map((p) => run((s) => releaseRoom(s, p, g.id))),
      ),
    );
    const after = (await store.getWithMetadata("rooms"))!.data as RoomIndex<Room>;
    assert.equal(Object.keys(after.members).length, 0);
    await run((s) => claimRoom(s, { id: `fresh-${wave}`, participantIds: ["0", "1", "2"] }));
    await Promise.all(
      Object.values(before.groups).map((g) => run((s) => releaseRoom(s, "0", g.id))),
    );
    assert.equal(
      ((await store.getWithMetadata("rooms"))!.data as RoomIndex<Room>).members["0"],
      `fresh-${wave}`,
    );
    await run((s) => releaseRoom(s, "0", `fresh-${wave}`));
  }
  assert.ok(store.conflicts > 0);
  console.log(
    JSON.stringify({ participants: 100, actions, detectedWriteConflicts: store.conflicts }),
  );
});

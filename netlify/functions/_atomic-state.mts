function requireDatabase(key: string) {
  if (!key.includes("evt_9_ekim_2026") && !key.startsWith("runs/")) return false;
  if (process.env.NETLIFY_DB_URL) return true;
  if (process.env.NETLIFY || process.env.CONTEXT)
    throw new Error("Etkinlik veri tabanı bağlı değil. Eşleşme güvenli biçimde durduruldu.");
  return false;
}

export async function readAtomicState<T>(store: any, key: string, initial: () => T): Promise<T> {
  if (!requireDatabase(key)) {
    return (await store.get(key, { type: "json", consistency: "strong" })) ?? initial();
  }
  const { getDatabase } = await import("@netlify/database");
  const db = getDatabase();
  const { rows } = await db.pool.query("SELECT state FROM ntw_atomic_state WHERE key = $1", [key]);
  if (rows[0]) return rows[0].state as T;
  return (await store.get(key, { type: "json", consistency: "strong" })) ?? initial();
}

export async function deleteAtomicState(key: string) {
  if (!requireDatabase(key)) return;
  const { getDatabase } = await import("@netlify/database");
  await getDatabase().pool.query("DELETE FROM ntw_atomic_state WHERE key = $1", [key]);
}

export async function deleteAtomicPrefix(prefix: string) {
  if (!requireDatabase(prefix)) return;
  const { getDatabase } = await import("@netlify/database");
  await getDatabase().pool.query("DELETE FROM ntw_atomic_state WHERE key LIKE $1", [
    `${prefix.replace(/[\\%_]/g, "\\$&")}%`,
  ]);
}

// Netlify Blobs is last-write-wins even when conditional options report success.
// A row lock serializes every read/mutate/write across all Function instances.
export async function atomicState<T, R>(
  store: any,
  key: string,
  initial: () => T,
  mutate: (state: T) => R,
): Promise<R> {
  if (requireDatabase(key)) {
    const { getDatabase } = await import("@netlify/database");
    const client = await getDatabase().pool.connect();
    try {
      const seed = (await store.get(key, { type: "json", consistency: "strong" })) ?? initial();
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO ntw_atomic_state (key, state) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING",
        [key, JSON.stringify(seed)],
      );
      const { rows } = await client.query(
        "SELECT state FROM ntw_atomic_state WHERE key = $1 FOR UPDATE",
        [key],
      );
      const state = rows[0].state as T;
      const result = mutate(state);
      await client.query(
        "UPDATE ntw_atomic_state SET state = $2::jsonb, updated_at = NOW() WHERE key = $1",
        [key, JSON.stringify(state)],
      );
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  for (let attempt = 0; attempt < 150; attempt++) {
    const snapshot = await store.getWithMetadata(key, { type: "json", consistency: "strong" });
    const state = snapshot?.data ?? initial();
    const result = mutate(state);
    const written = await store.setJSON(
      key,
      state,
      snapshot ? { onlyIfMatch: snapshot.etag } : { onlyIfNew: true },
    );
    if (written.modified) return result;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * Math.min(100, 5 + attempt * 3)),
    );
  }
  throw new Error("İşlemler yoğun. Lütfen tekrar dene.");
}

export type RoomIndex<T> = { groups: Record<string, T>; members: Record<string, string> };
export const emptyRooms = <T,>(): RoomIndex<T> => ({ groups: {}, members: {} });
export function claimRoom<T extends { id: string; participantIds: string[] }>(
  state: RoomIndex<T>,
  group: T,
) {
  if (group.participantIds.some((id) => state.members[id])) return false;
  state.groups[group.id] = group;
  for (const id of group.participantIds) state.members[id] = group.id;
  return true;
}
export function releaseRoom<T extends { id: string; participantIds: string[] }>(
  state: RoomIndex<T>,
  person: string,
  expectedId: string,
) {
  if (state.members[person] !== expectedId) return false;
  const group = state.groups[expectedId];
  if (!group) return false;
  for (const id of group.participantIds)
    if (state.members[id] === expectedId) delete state.members[id];
  delete state.groups[expectedId];
  return true;
}

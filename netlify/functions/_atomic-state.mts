// Optimistic concurrency across function instances, not a process-local mutex.
export async function atomicState<T, R>(
  store: any,
  key: string,
  initial: () => T,
  mutate: (state: T) => R,
): Promise<R> {
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

import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { atomicState } from "./_atomic-state.mjs";

// Admin-only infrastructure probe. It never reads or writes participant records.
export async function probeStorageLoad(sampleSize: 20 | 100 = 20) {
  const store = getStore({ name: "ntw-load-diagnostic", consistency: "strong" });
  const key = `runs/${randomUUID()}.json`;
  const started = Date.now();
  try {
    const initial = await store.setJSON(key, { count: 0, completed: [] }, { onlyIfNew: true });
    const duplicate = await store.setJSON(key, { count: -1, completed: [] }, { onlyIfNew: true });
    const seeded = await store.getWithMetadata(key, { type: "json", consistency: "strong" });
    const conditional = seeded?.etag
      ? await store.setJSON(key, { count: 1, completed: [] }, { onlyIfMatch: seeded.etag })
      : null;
    const stale = seeded?.etag
      ? await store.setJSON(key, { count: -2, completed: [] }, { onlyIfMatch: seeded.etag })
      : null;
    const afterConditional = await store.getWithMetadata(key, { type: "json", consistency: "strong" });
    if (afterConditional?.etag)
      await store.setJSON(key, { count: 0, completed: [] }, { onlyIfMatch: afterConditional.etag });
    const results = await Promise.allSettled(
      Array.from({ length: sampleSize }, async (_, index) => {
        const began = Date.now();
        await atomicState(
          store,
          key,
          () => ({ count: 0, completed: [] as number[] }),
          (state) => {
            state.count += 1;
            state.completed.push(index);
          },
        );
        return Date.now() - began;
      }),
    );
    const state = (await store.get(key, { type: "json", consistency: "strong" })) as {
      count: number;
      completed: number[];
    } | null;
    await new Promise((resolve) => setTimeout(resolve, 750));
    const delayedState = (await store.get(key, { type: "json", consistency: "strong" })) as {
      count: number;
      completed: number[];
    } | null;
    const durations = results
      .filter((row): row is PromiseFulfilledResult<number> => row.status === "fulfilled")
      .map((row) => row.value)
      .sort((left, right) => left - right);
    const fulfilled = durations.length;
    const unique = new Set(state?.completed || []).size;
    return {
      requested: sampleSize,
      fulfilled,
      stored: state?.count ?? 0,
      unique,
      initialWriteAccepted: initial.modified,
      duplicateWriteRejected: !duplicate.modified,
      seededCount: seeded?.data?.count ?? null,
      seededEtagPresent: Boolean(seeded?.etag),
      conditionalWriteAccepted: conditional?.modified ?? false,
      staleWriteRejected: stale ? !stale.modified : false,
      conditionalCount: afterConditional?.data?.count ?? null,
      delayedStored: delayedState?.count ?? 0,
      durationMs: Date.now() - started,
      p95Ms: durations[Math.max(0, Math.ceil(fulfilled * 0.95) - 1)] ?? null,
      passed: fulfilled === sampleSize && state?.count === sampleSize && unique === sampleSize,
      failures: results
        .filter((row): row is PromiseRejectedResult => row.status === "rejected")
        .slice(0, 3)
        .map((row) => (row.reason instanceof Error ? row.reason.message : "İşlem başarısız")),
    };
  } finally {
    await store.delete(key);
  }
}

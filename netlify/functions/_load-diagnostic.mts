import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { atomicState, deleteAtomicState, readAtomicState } from "./_atomic-state.mjs";

// Admin-only infrastructure probe. It never reads or writes participant records.
export async function probeStorageLoad(sampleSize: 20 | 100 = 20) {
  const store = getStore({ name: "ntw-load-diagnostic", consistency: "strong" });
  const key = `runs/${randomUUID()}.json`;
  const started = Date.now();
  try {
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
    const state = await readAtomicState(store, key, () => ({ count: 0, completed: [] as number[] }));
    const durations = results
      .filter((row): row is PromiseFulfilledResult<number> => row.status === "fulfilled")
      .map((row) => row.value)
      .sort((left, right) => left - right);
    const fulfilled = durations.length;
    const unique = new Set(state.completed).size;
    return {
      requested: sampleSize,
      fulfilled,
      stored: state.count,
      unique,
      databaseBacked: Boolean(process.env.NETLIFY_DB_URL),
      durationMs: Date.now() - started,
      p95Ms: durations[Math.max(0, Math.ceil(fulfilled * 0.95) - 1)] ?? null,
      passed: fulfilled === sampleSize && state.count === sampleSize && unique === sampleSize,
      failures: results
        .filter((row): row is PromiseRejectedResult => row.status === "rejected")
        .slice(0, 3)
        .map((row) => (row.reason instanceof Error ? row.reason.message : "İşlem başarısız")),
    };
  } finally {
    await deleteAtomicState(key);
    await store.delete(key);
  }
}

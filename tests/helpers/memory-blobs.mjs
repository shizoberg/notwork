// Isolated, versioned Blob double. Never imports the Netlify SDK or accesses the network.
export const stores = new Map();
export const metrics = { reads: 0, writes: 0, lists: 0, conflicts: 0 };
export function resetMetrics() {
  for (const key of Object.keys(metrics)) metrics[key] = 0;
}
export function getStore({ name }) {
  if (stores.has(name)) return stores.get(name);
  const rows = new Map();
  let revision = 0;
  const store = {
    rows,
    async get(key) {
      metrics.reads++;
      return structuredClone(rows.get(key)?.data ?? null);
    },
    async getWithMetadata(key) {
      metrics.reads++;
      return structuredClone(rows.get(key) ?? null);
    },
    async setJSON(key, data, options = {}) {
      metrics.writes++;
      const old = rows.get(key);
      if (
        (options.onlyIfNew && old) ||
        (options.onlyIfMatch && old?.etag !== options.onlyIfMatch)
      ) {
        metrics.conflicts++;
        return { modified: false };
      }
      const etag = String(++revision);
      rows.set(key, { data: structuredClone(data), etag });
      return { modified: true, etag };
    },
    async set(key, value, options) {
      return store.setJSON(key, value, options);
    },
    async delete(key) {
      rows.delete(key);
    },
    async list({ prefix = "" } = {}) {
      metrics.lists++;
      return {
        blobs: [...rows.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key })),
      };
    },
  };
  stores.set(name, store);
  return store;
}

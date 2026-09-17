type SessionStorage = Pick<Storage, "getItem" | "setItem">;

// Registry-provided aliases only: never borrow a token from a different event.
export function syncEventSessionAliases(
  storage: SessionStorage,
  event: { id: string; slug: string },
) {
  const keys = [...new Set([event.slug, event.id])]
    .filter(Boolean)
    .map((identifier) => `notwork_event_network_token:${identifier}`);
  const token = keys.map((key) => storage.getItem(key)).find(Boolean);
  if (!token) return;
  for (const key of keys) {
    if (!storage.getItem(key)) storage.setItem(key, token);
  }
}

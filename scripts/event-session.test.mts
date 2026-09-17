import { test } from "node:test";
import assert from "node:assert/strict";
import { syncEventSessionAliases } from "../src/lib/event-session.ts";

function storage(entries: [string, string][]) {
  const values = new Map(entries);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}
const event = { id: "evt_17_eylul_2026", slug: "17-eylul-2026" };
const key = (id: string) => `notwork_event_network_token:${id}`;

test("Linkler slug session is available to Match and Five after ID redirect", () => {
  const store = storage([[key(event.slug), "registered-token"]]);
  syncEventSessionAliases(store, event);
  assert.equal(store.getItem(key(event.id)), "registered-token");
});
test("ID session survives returning to Linkler and reloading", () => {
  const store = storage([[key(event.id), "resumed-token"]]);
  syncEventSessionAliases(store, event);
  syncEventSessionAliases(store, event);
  assert.equal(store.getItem(key(event.slug)), "resumed-token");
});
test("never imports another event session or overwrites an existing token", () => {
  const store = storage([[key("21-agustos-2026"), "other-event"]]);
  syncEventSessionAliases(store, event);
  assert.equal(store.getItem(key(event.id)), null);
  store.setItem(key(event.slug), "slug-token");
  store.setItem(key(event.id), "id-token");
  syncEventSessionAliases(store, event);
  assert.equal(store.getItem(key(event.id)), "id-token");
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  syncOpenAIAdsPixel,
  measureOpenAIAdsEvent,
  openAIAdsTicketClick,
} from "../src/lib/openai-ads-tracking.ts";

test("OpenAI tracking requires consent; private/preview paths are excluded; ticket click never becomes a purchase", () => {
  const oldWindow = globalThis.window,
    oldDocument = globalThis.document;
  const records: unknown[][] = [];
  const scripts: Record<string, unknown>[] = [];
  let consent = "necessary";
  const fake = {
    localStorage: { getItem: () => JSON.stringify({ status: consent }) },
    location: { pathname: "/22-kasim", search: "" },
    oaiq: undefined as any,
  };
  Object.assign(globalThis, {
    window: fake,
    document: {
      getElementById: () => scripts[0] || null,
      createElement: () => ({}),
      head: { appendChild: (s: any) => scripts.push(s) },
    },
  });
  try {
    assert.equal(syncOpenAIAdsPixel("local-test-only", "/22-kasim", false), false);
    assert.equal(scripts.length, 0);
    assert.equal(fake.oaiq, undefined);
    consent = "accepted";
    assert.equal(syncOpenAIAdsPixel("", "/22-kasim", false), false);
    fake.oaiq = (...args: unknown[]) => records.push(args);
    assert.equal(syncOpenAIAdsPixel("local-test-only", "/22-kasim", false), true);
    assert.deepEqual(records.slice(-3), [
      ["consent", false],
      ["init", { pixelId: "local-test-only" }],
      ["consent", true],
    ]);
    assert.equal(scripts.length, 1);
    syncOpenAIAdsPixel("local-test-only", "/22-kasim", false);
    assert.equal(records.filter((r) => r[0] === "init").length, 1);
    const payload = openAIAdsTicketClick({
      metaContentId: "sahne-22-kasim",
      metaTicketOption: "duo",
      metaContent: "Notwork Sahne",
      email: "must-not-send@example.org",
      metaTicketPrice: "1100",
    });
    measureOpenAIAdsEvent("custom", payload, { custom_event_name: "ticket_button_click" });
    const sent = records.at(-1)!;
    assert.deepEqual(sent, [
      "measure",
      "custom",
      payload,
      { custom_event_name: "ticket_button_click", opt_out: true },
    ]);
    assert.equal(JSON.stringify(sent).includes("must-not-send"), false);
    assert.equal(JSON.stringify(sent).includes("order_created"), false);
    assert.equal("amount" in payload, false);
    const measurements = () => records.filter((r) => r[0] === "measure").length;
    const count = measurements();
    consent = "necessary";
    measureOpenAIAdsEvent("custom", payload);
    assert.equal(measurements(), count);
    assert.equal(syncOpenAIAdsPixel("local-test-only", "/22-kasim", false), false);
    assert.deepEqual(records.at(-1), ["consent", false]);
    consent = "accepted";
    for (const path of [
      "/profil",
      "/networking",
      "/launch-space",
      "/adminalaunch",
      "/admin",
      "/linkler",
    ]) {
      fake.location.pathname = path;
      assert.equal(syncOpenAIAdsPixel("local-test-only", path, false), false);
      measureOpenAIAdsEvent("custom", payload);
    }
    fake.location.pathname = "/22-kasim";
    fake.location.search = "?analyticsPreview=1";
    assert.equal(syncOpenAIAdsPixel("local-test-only", "/22-kasim", true), false);
    measureOpenAIAdsEvent("custom", payload);
    assert.equal(measurements(), count);
  } finally {
    Object.assign(globalThis, { window: oldWindow, document: oldDocument });
  }
});

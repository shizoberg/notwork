import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { functionSandbox } from "./helpers/function-sandbox.mjs";
const dir = await fs.mkdtemp(path.join(os.tmpdir(), "launch-persistent-test-"));
process.env.NTW_AI_ENABLED = "false";
process.env.MEMBER_PROFILE_STORE = "launch-persist-profiles";
process.env.MEMBER_SOURCE_STORE = "launch-persist-members";
let s = await functionSandbox({ persistDir: dir });
try {
  let reg = await s.load("_event-registry-store");
  const lib = await s.loadLib("event-poll");
  const event = await reg.createEvent(lib.novemberEventDraft);
  const ctx = await s.load("_event-product-context");
  const net = await s.load("_event-network-store");
  const profile = await ctx.runWithEventRequestContext(event.slug, "matchlab", () =>
    net.registerNetworkProfile(net.getEventNetworkStore(), {
      firstName: "Kalıcı",
      lastName: "Demo",
      email: "persist@demo.example.org",
      attendedEvent: event.slug,
      offers: ["tasarım"],
      needs: "Birlikte üretmek",
      needTag: "networking",
      eventConsent: true,
    }),
  );
  await s.cleanup();
  s = await functionSandbox({ persistDir: dir });
  reg = await s.load("_event-registry-store");
  assert.equal((await reg.getEvent(event.slug)).id, event.id);
  const c2 = await s.load("_event-product-context");
  const n2 = await s.load("_event-network-store");
  const restored = await c2.runWithEventRequestContext(event.slug, "matchlab", () =>
    n2.getRegistrationByToken(n2.getEventNetworkStore(), profile.accessToken),
  );
  assert.equal(restored.participant.id, profile.participant.id);
  console.log(
    "PASS: isolated local storage preserves event ID and participant session across backend sandbox restart.",
  );
} finally {
  await s.cleanup();
  await fs.rm(dir, { recursive: true, force: true });
}

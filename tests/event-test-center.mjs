import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { functionSandbox } from "./helpers/function-sandbox.mjs";

const sandbox = await functionSandbox();
const before = process.env.NTW_AI_ENABLED;
process.env.NTW_AI_ENABLED = "false";
try {
  const registry = await sandbox.load("_event-registry-store");
  const context = await sandbox.load("_event-product-context");
  const network = await sandbox.load("_event-network-store");
  await registry.ensureEventRegistrySeeded();
  const samples = JSON.parse(
    await readFile(
      new URL("../netlify/data/21-agustos-network-sample.json", import.meta.url),
      "utf8",
    ),
  );
  const selected = "evt_9_ekim_2026";
  const another = "evt_17_eylul_2026";
  const inspect = (eventId, mode, callback) =>
    context.runWithEventRequestContext(eventId, "matchlab", callback, {
      allowDisabled: true,
      allowHidden: true,
      modeOverride: mode,
    });

  await inspect(selected, "demo", async () => {
    const store = network.getEventNetworkStore();
    await network.resetDemoEventNetworkDataset(store);
    const first = await network.seedSampleRegistrations(store, samples.slice(0, 1));
    const firstWait = await network.getNextMatchGroup(store, first[0].accessToken);
    assert.equal(firstWait.status, "empty");
    assert.equal(firstWait.waitingCount, 1);
    await network.seedSampleRegistrations(store, samples.slice(1, 2));
    const secondWait = await network.getNextMatchGroup(store, first[0].accessToken);
    assert.equal(secondWait.status, "empty");
    assert.equal(secondWait.waitingCount, 2);
    const third = await network.seedSampleRegistrations(store, samples.slice(2, 3));
    assert.equal((await network.getNextMatchGroup(store, first[0].accessToken)).status, "ready");
    assert.equal(third.length, 1);
    await network.resetDemoEventNetworkDataset(store);
    const seeded = await network.seedSampleRegistrations(store, samples);
    assert.equal(seeded.length, 12);
    for (const registration of seeded) {
      await network.getNextMatchGroup(store, registration.accessToken);
    }
    const registrations = await network.listRegistrations(store);
    const groups = await network.listActiveMatchGroups(store, registrations);
    assert.equal(registrations.length, 12);
    assert.ok(groups.length >= 3);
    assert.ok(groups.every((group) => group.memberNames.length >= 2));
    assert.equal(network.getEventNetworkDatasetInfo().mode, "demo");
  });
  await inspect(selected, "live", async () => {
    assert.equal((await network.listRegistrations(network.getEventNetworkStore())).length, 0);
  });
  await inspect(another, "demo", async () => {
    assert.equal((await network.listRegistrations(network.getEventNetworkStore())).length, 0);
  });
  assert.equal(
    (await sandbox.blobs.getStore({ name: "networking-members" }).list()).blobs.length,
    0,
    "Sanal kullanıcılar genel Networking alanına yazılmamalı",
  );
  console.log(
    "PASS event test center: 12 synthetic registrations and groups stay in the selected event demo dataset.",
  );
} finally {
  process.env.NTW_AI_ENABLED = before;
  await sandbox.cleanup();
}

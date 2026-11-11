import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { functionSandbox } from "./helpers/function-sandbox.mjs";
process.env.LAUNCH_ADMIN_USERNAME = "launch-test";
process.env.LAUNCH_ADMIN_PASSWORD_HASH = createHash("sha256")
  .update("SeparateDemoPass27!")
  .digest("hex");
process.env.LAUNCH_ADMIN_SECRET = "test-only-signing-key-abcdefghijklmnopqrstuvwxyz";
process.env.NTW_AI_ENABLED = "false";
const s = await functionSandbox({ adminPassword: "MainAdminTest27!" });
try {
  const registry = await s.load("_event-registry-store"),
    lib = await s.loadLib("event-poll");
  const event = await registry.createEvent(lib.novemberEventDraft);
  const other = await registry.createEvent({ ...lib.novemberEventDraft, slug: "another-event" });
  const login = (await s.load("launch-admin")).default;
  const poll = (await s.load("event-poll")).default;
  const net = (await s.load("event-network-admin")).default;
  const account = (await s.load("event-registry-admin")).default;
  async function call(fn, input, cookie = "") {
    return fn(
      new Request("https://notwork.test/api/test", {
        method: "POST",
        headers: { "content-type": "application/json", cookie, origin: "https://notwork.test" },
        body: JSON.stringify(input),
      }),
      { ip: "127.0.0.1" },
    );
  }
  let r = await call(login, { action: "login", username: "launch-test", password: "wrong" });
  assert.equal(r.status, 401);
  r = await call(login, {
    action: "login",
    username: "launch-test",
    password: "SeparateDemoPass27!",
  });
  assert.equal(r.status, 200);
  const cookie = r.headers.get("set-cookie").split(";")[0];
  assert.match(r.headers.get("set-cookie"), /HttpOnly/);
  assert.match(r.headers.get("set-cookie"), /Secure/);
  const logo = await readFile(new URL("../public/launchspace/logo.jpg", import.meta.url));
  const assetUrl = "https://notwork.test/api/launch-admin?asset=upload";
  const upload = (body, session = "") =>
    login(
      new Request(assetUrl, {
        method: "POST",
        headers: { cookie: session },
        body,
      }),
      {},
    );
  assert.equal((await upload(logo)).status, 401);
  assert.equal((await upload("<svg/>", cookie)).status, 400);
  const uploaded = await upload(logo, cookie);
  assert.equal(uploaded.status, 200);
  const { url } = await uploaded.json();
  const asset = await login(new Request("https://notwork.test" + url), {});
  assert.equal(asset.headers.get("content-type"), "image/jpeg");
  assert.deepEqual(Buffer.from(await asset.arrayBuffer()), logo);
  async function readFlow() {
    const response = await login(new Request("https://notwork.test/api/launch-admin"), {});
    assert.equal(response.status, 200);
    return response.json();
  }
  assert.equal((await call(login, { action: "listDatasets" })).status, 401);
  assert.equal(
    (await call(login, { action: "createDataset", name: "Prova", mode: "demo" })).status,
    401,
  );
  const datasetResponse = await call(
    login,
    { action: "createDataset", name: "Prova", mode: "demo" },
    cookie,
  );
  assert.equal(datasetResponse.status, 200);
  const datasets = await datasetResponse.json();
  assert.equal(datasets.active.id, "legacy-demo");
  assert.equal(datasets.datasets.at(-1).name, "Prova");
  const selectedDataset = await call(
    login,
    { action: "activateDataset", id: datasets.datasets.at(-1).id },
    cookie,
  );
  assert.equal((await selectedDataset.json()).active.name, "Prova");
  assert.equal(
    (await call(login, { action: "activateDataset", id: "legacy-demo" }, cookie)).status,
    200,
  );
  const flow = await readFlow();
  assert.equal(flow.revision, 0);
  flow.logo = url;
  flow.organizerName = "launchspace networking party";
  flow.schedule.push({ time: "20:00", label: "Networking" });
  flow.questions[0].options = ["Tasarım", "Teknoloji"];
  flow.apps.reverse();
  assert.equal((await call(login, { action: "saveFlow", flow })).status, 401);
  assert.equal(
    (await call(login, { action: "saveFlow", flow: { ...flow, apps: ["poll", "poll"] } }, cookie))
      .status,
    400,
  );
  assert.equal(
    (await call(login, { action: "saveFlow", flow, event: other.id }, cookie)).status,
    200,
  );
  assert.deepEqual(await readFlow(), { ...flow, revision: 1 });
  assert.equal((await call(login, { action: "saveFlow", flow }, cookie)).status, 409);
  assert.equal(
    await s.blobs
      .getStore({ name: "event-network" })
      .get(`events/${other.id}/launch-flow.json`, { type: "json" }),
    null,
  );
  r = await call(poll, { action: "admin", event: event.slug }, cookie);
  assert.equal(r.status, 200);
  const pollConfig = (await r.json()).config;
  assert.equal(pollConfig.questions.length, 1);
  const draft = pollConfig.questions.map((q) => ({ ...q, options: [...q.options, "Firma altı"] }));
  r = await call(
    poll,
    {
      action: "configure",
      event: event.slug,
      revision: pollConfig.revision,
      questions: [...draft, { title: "İkinci soru", options: ["Evet", "Hayır"] }],
    },
    cookie,
  );
  assert.equal(r.status, 200);
  const expanded = (await r.json()).config;
  assert.equal(expanded.questions.length, 2);
  r = await call(
    poll,
    {
      action: "configure",
      event: event.slug,
      revision: expanded.revision,
      questions: draft,
    },
    cookie,
  );
  assert.equal(r.status, 200);
  const reduced = (await r.json()).config;
  assert.equal(reduced.questions.length, 1);
  assert.equal(reduced.questions[0].options.length, 6);
  r = await call(
    poll,
    {
      action: "publish",
      event: event.slug,
      revision: reduced.revision,
      questionIndex: 1,
    },
    cookie,
  );
  assert.equal(r.status, 400);
  r = await call(poll, { action: "admin", event: other.id }, cookie);
  assert.equal(r.status, 401);
  r = await call(net, { action: "matchOverview", event: event.id }, cookie);
  assert.equal(r.status, 200);
  const overview = await r.json();
  assert.equal(overview.registrations, undefined);
  assert.equal(overview.registeredCount, 0);
  assert.equal((await call(net, { action: "matchOverview", event: other.id }, cookie)).status, 401);
  r = await call(net, { action: "list", event: event.id }, cookie);
  assert.equal(r.status, 200);
  r = await call(net, { action: "list", event: other.id }, cookie);
  assert.equal(r.status, 401);
  r = await call(net, { action: "resetDemo", event: event.id }, cookie);
  assert.equal(r.status, 403);
  r = await call(account, { action: "list" }, cookie);
  assert.equal(r.status, 401);
  r = await call(poll, { action: "admin", event: event.id }, cookie + "changed");
  assert.equal(r.status, 401);
  r = await call(login, { action: "me" }, cookie);
  assert.equal((await r.json()).authenticated, true);
  r = await call(login, { action: "logout" }, cookie);
  assert.match(r.headers.get("set-cookie"), /Max-Age=0/);
  console.log(
    "PASS separate launch admin: credential check, secure cookie, own event access, other event/main admin blocked, destructive network operation blocked, tampered cookie rejected, logout.",
  );
} finally {
  await s.cleanup();
}

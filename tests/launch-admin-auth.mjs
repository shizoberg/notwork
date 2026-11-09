import assert from "node:assert/strict";
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
  r = await call(poll, { action: "admin", event: event.slug }, cookie);
  assert.equal(r.status, 200);
  r = await call(poll, { action: "admin", event: other.id }, cookie);
  assert.equal(r.status, 401);
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

import assert from "node:assert/strict";
import { functionSandbox } from "./helpers/function-sandbox.mjs";
process.env.NTW_AI_ENABLED = "false";
process.env.MEMBER_PROFILE_STORE = "launch-test-profiles";
process.env.MEMBER_SOURCE_STORE = "launch-test-members";
const password = "LaunchSpaceTest2026!";
const sandbox = await functionSandbox({ adminPassword: password });
try {
  const registry = await sandbox.load("_event-registry-store");
  const context = await sandbox.load("_event-product-context");
  const network = await sandbox.load("_event-network-store");
  const poll = (await sandbox.load("event-poll")).default;
  const handler = (await sandbox.load("event-network")).default;
  const admin = (await sandbox.load("event-network-admin")).default;
  const lib = await sandbox.loadLib("event-poll");
  const event = await registry.createEvent(lib.novemberEventDraft);
  const other = await registry.createEvent({
    ...lib.novemberEventDraft,
    slug: "other-isolated-event",
  });
  const call = async (fn, input) => {
    const r = await fn(
      new Request("http://127.0.0.1/api/test", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://127.0.0.1" },
        body: JSON.stringify({ event: event.slug, ...input }),
      }),
      {},
    );
    const text = await r.text();
    return { status: r.status, data: r.ok ? JSON.parse(text) : text };
  };
  const participants = [];
  for (let i = 0; i < 100; i++) {
    const r = await call(handler, {
      action: "register",
      firstName: "Demo",
      lastName: `Kişi ${i}`,
      email: `demo-${i}@demo.example.org`,
      offers: [i % 2 ? "tasarım" : "yazılım"],
      intro: "Yerel demo katılımcısı",
      offersDetail: "Deneyim paylaşımı ve fikir geliştirme",
      needs: "Ürün ve iletişim alanından insanlarla tanışmak",
      needTag: "networking",
      attendedEvent: event.slug,
      eventConsent: true,
    });
    assert.equal(r.status, 201, r.data);
    participants.push(r.data);
  }
  let r = await call(handler, { action: "match", accessToken: participants[0].accessToken });
  assert.equal(r.data.waitingReason, "admin");
  let launch = await call(admin, { action: "startMatching", password });
  while (launch.data.matching.status === "running")
    launch = await call(admin, { action: "processMatching", password });
  const groups = new Map();
  let matched = 0;
  for (const p of participants) {
    const r = await call(handler, { action: "match", accessToken: p.accessToken });
    if (r.data.group) {
      matched++;
      groups.set(r.data.group.id, r.data.group);
      assert.equal(r.data.group.members.length, 3);
    }
  }
  assert.equal(matched, 99);
  assert.equal(groups.size, 33);
  const grouped = [...groups.values()];
  assert.equal(new Set(grouped.flatMap((g) => g.members.map((m) => m.participantId))).size, 99);
  const g = grouped[0],
    m = g.members[0];
  const member = participants.find((p) => p.participant.id === m.participantId);
  const outsider = participants.find(
    (p) => !g.members.some((m) => m.participantId === p.participant.id),
  );
  r = await call(handler, {
    action: "chatSend",
    accessToken: member.accessToken,
    groupId: g.id,
    message: "Yalnızca bizim grup",
    messageId: crypto.randomUUID(),
  });
  assert.equal(r.status, 200);
  r = await call(handler, { action: "chatRead", accessToken: outsider.accessToken, groupId: g.id });
  assert.ok(r.status >= 400);
  r = await call(handler, { action: "me", accessToken: member.accessToken });
  assert.equal(r.data.participant.id, member.participant.id);
  r = await call(poll, { action: "admin", password: "wrong" });
  assert.equal(r.status, 401);
  r = await call(poll, { action: "submit", answers: [] });
  assert.equal(r.status, 401);
  let state = (await call(poll, { action: "admin", password })).data;
  state = (
    await call(poll, { action: "open", password, revision: state.config.revision, isOpen: true })
  ).data;
  const answers = state.config.questions.map((q) => q.options[0]);
  const results = await Promise.all(
    participants.map((p) =>
      call(poll, {
        action: "submit",
        accessToken: p.accessToken,
        questionVersion: state.config.questionVersion,
        answers,
      }),
    ),
  );
  assert.ok(
    results.every((r) => r.status === 200),
    JSON.stringify(results.filter((r) => r.status !== 200)),
  );
  state = (await call(poll, { action: "admin", password })).data;
  assert.equal(state.total, 100);
  assert.ok(state.results.every((r) => r.counts[0].count === 100));
  await call(poll, {
    action: "submit",
    accessToken: participants[0].accessToken,
    questionVersion: state.config.questionVersion,
    answers,
  });
  assert.equal((await call(poll, { action: "admin", password })).data.total, 100);
  r = await call(poll, { action: "stage" });
  assert.equal(r.data.published, null);
  assert.equal(r.data.results, undefined);
  assert.equal(r.data.ballots, undefined);
  state = (
    await call(poll, {
      action: "publish",
      password,
      revision: state.config.revision,
      questionIndex: 2,
    })
  ).data;
  r = await call(poll, { action: "stage" });
  assert.equal(r.data.published.total, 100);
  assert.equal(state.config.questionVersion, 1);
  assert.equal(r.data.published.question.id, state.config.questions[2].id);
  assert.ok(!JSON.stringify(r.data).includes("demo-0@"));
  r = await call(poll, {
    action: "configure",
    password,
    revision: state.config.revision,
    questions: state.config.questions,
  });
  assert.equal(r.status, 400);
  r = await call(poll, { action: "admin", event: other.slug, password });
  assert.equal(r.data.total, 0);
  r = await call(poll, {
    action: "submit",
    event: other.slug,
    accessToken: participants[0].accessToken,
    answers,
  });
  assert.equal(r.status, 401);
  r = await call(poll, { action: "status", mode: "live" });
  assert.equal(r.data.database.mode, "demo");
  await registry.updateEvent(event.id, { products: { matchlab: { dataMode: "live" } } });
  r = await call(poll, { action: "admin", password });
  assert.equal(r.data.total, 0);
  assert.equal(r.data.database.mode, "live");
  r = await call(poll, { action: "reset", password, revision: r.data.config.revision });
  assert.equal(r.status, 400);
  await registry.updateEvent(event.id, { products: { matchlab: { dataMode: "demo" } } });
  r = await call(poll, { action: "admin", password });
  assert.equal(r.data.total, 100);
  // Rematching releases only this room; another room's chat/assignment remains unchanged.
  const otherGroup = grouped.find((x) => x.id !== g.id);
  const otherMember = participants.find(
    (p) => p.participant.id === otherGroup.members[0].participantId,
  );
  r = await call(handler, {
    action: "rotateMatch",
    accessToken: member.accessToken,
    groupId: g.id,
  });
  assert.equal(r.status, 200);
  r = await call(handler, { action: "match", accessToken: otherMember.accessToken });
  assert.equal(r.data.group.id, otherGroup.id);
  await registry.updateEvent(event.id, {
    products: { matchlab: { enabled: false, visible: false } },
  });
  r = await call(poll, { action: "stage" });
  assert.equal(r.status, 200);
  assert.equal(r.data.published.total, 100);
  console.log(
    "PASS: real handlers, 100 participants → 33 disjoint groups + 1 waiting; admin launch; session recovery; private chat; 100 concurrent ballots; idempotency; stage publication; auth; event/demo/live isolation; rematch isolation. No production data/AI.",
  );
} finally {
  await sandbox.cleanup();
}

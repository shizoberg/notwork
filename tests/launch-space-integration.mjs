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
  assert.ok(participants.every((p) => /^[A-HJ-NP-Z][0-9]{3}$/.test(p.participant.publicCode)));
  for (const group of groups.values())
    assert.equal(group.members.filter((m) => m.isPhotoOwner).length, 1);
  const originalIds = [...groups.keys()].sort();
  for (let retry = 0; retry < 3; retry++) {
    await call(admin, { action: "startMatching", password });
    await call(admin, { action: "processMatching", password });
    const stable = await call(admin, { action: "list", password });
    assert.deepEqual(stable.data.groups.map((g) => g.id).sort(), originalIds);
  }

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
  assert.equal(state.config.questions.length, 1);
  assert.deepEqual(state.config.questions[0].options, lib.launchCompanyQuestions[0].options);
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
      questionIndex: 0,
    })
  ).data;
  r = await call(poll, { action: "stage" });
  assert.equal(r.data.published.total, 100);
  assert.equal(state.config.questionVersion, 1);
  assert.equal(r.data.published.question.id, state.config.questions[0].id);
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
  const deniedReset = await handler(
    new Request("https://notwork.me/api/event-products/network", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: event.slug, action: "seedSamples" }),
    }),
    {},
  );
  assert.equal(deniedReset.status, 403);
  // Code repair preserves session identities and already formed groups.
  await context.runWithEventRequestContext(event.slug, "matchlab", async () => {
    const store = network.getEventNetworkStore();
    const prefix = network.getEventNetworkDatasetInfo().keyPrefix;
    const row = await network.getRegistrationByToken(store, member.accessToken);
    row.participant.publicCode = "OLD-LONG-CODE";
    for (const key of [
      `${prefix}/participants/${row.participant.id}.json`,
      `${prefix}/profiles/${encodeURIComponent(row.profile.emailNormalized)}.json`,
    ])
      await store.setJSON(key, row);
    const result = await network.repairParticipantCodes(store);
    assert.equal(result.repaired, 1);
    const repaired = await network.getRegistrationByToken(store, member.accessToken);
    assert.equal(repaired.participant.id, row.participant.id);
    assert.match(repaired.participant.publicCode, /^[A-HJ-NP-Z][0-9]{3}$/);
    assert.equal(repaired.participant.accessTokenHash, row.participant.accessTokenHash);
    assert.equal((await network.getNextMatchGroup(store, member.accessToken)).group.id, g.id);
    const codes = (await network.listRegistrations(store)).map((r) => r.participant.publicCode);
    assert.equal(new Set(codes).size, 100);
  });
  // Directory: event members only, contact/session fields never leave the server.
  r = await call(handler, { action: "people", accessToken: member.accessToken });
  assert.equal(r.data.people.length, 100);
  assert.equal(JSON.stringify(r.data).includes("demo-0@"), false);
  assert.equal(JSON.stringify(r.data).includes("accessToken"), false);
  assert.ok((await call(handler, { action: "people" })).status >= 400);
  assert.ok(
    (await call(handler, { action: "people", event: other.slug, accessToken: member.accessToken }))
      .status >= 400,
  );
  r = await call(handler, {
    action: "introduce",
    accessToken: member.accessToken,
    targetId: outsider.participant.id,
  });
  assert.equal(r.data.people.find((p) => p.id === outsider.participant.id).sent, true);
  r = await call(handler, {
    action: "introduce",
    accessToken: outsider.accessToken,
    targetId: member.participant.id,
  });
  const mutual = r.data.people.find((p) => p.id === member.participant.id);
  assert.equal(mutual.sent && mutual.received, true);
  assert.equal(
    (await call(handler, { action: "match", accessToken: member.accessToken })).data.group.id,
    g.id,
  );
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
  assert.equal(r.data.released, false);
  const vote = (p) =>
    call(handler, { action: "rotateMatch", accessToken: p.accessToken, groupId: g.id });
  r = await vote(member);
  assert.equal(r.data.approvedCount, 1);
  assert.equal(r.data.released, false);
  const peers = g.members
    .filter((m) => m.participantId !== member.participant.id)
    .map((m) => participants.find((p) => p.participant.id === m.participantId));
  r = await vote(peers[0]);
  assert.equal(r.data.released, false);
  assert.equal(r.data.approvedCount, 2);
  assert.equal(
    (await call(handler, { action: "match", accessToken: member.accessToken })).data.group.id,
    g.id,
  );
  r = await vote(peers[1]);
  assert.equal(r.data.released, true);
  assert.equal(r.data.approvedCount, 3);
  assert.ok(
    (await call(handler, { action: "chatRead", accessToken: member.accessToken, groupId: g.id }))
      .status >= 400,
  );
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

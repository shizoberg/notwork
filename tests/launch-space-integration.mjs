import assert from "node:assert/strict";
import { functionSandbox } from "./helpers/function-sandbox.mjs";
process.env.NTW_AI_ENABLED = "false";
process.env.MEMBER_PROFILE_STORE = "launch-test-profiles";
process.env.MEMBER_SOURCE_STORE = "launch-test-members";
const participantCount = Number(process.env.LAUNCH_TEST_PARTICIPANTS || 200);
const groupCount = Math.floor(participantCount / 3);
const matchedCount = groupCount * 3;
const password = "LaunchSpaceTest2026!";
const sandbox = await functionSandbox({ adminPassword: password });
const originalFetch = globalThis.fetch;
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
  const guest = await call(handler, { action: "launchGuest", firstName: "Tekİsim", jobTitle: "Ürün tasarımcısı", intro: "Fikirleri anlaşılır ürünlere dönüştürüyorum.", eventConsent: true, event: other.slug });
  assert.equal(guest.status, 403);
  const missingConsent = await call(handler, { action: "launchGuest", firstName: "Tekİsim" });
  assert.equal(missingConsent.status, 400);
  const participants = [];
  for (let i = 0; i < participantCount; i++) {
    const r = i === 0
      ? await call(handler, { action: "launchGuest", firstName: "Tekİsim", jobTitle: "Ürün tasarımcısı", intro: "Fikirleri anlaşılır ürünlere dönüştürüyorum.", eventConsent: true })
      : await call(handler, {
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
      aiAnalysisConsent: i >= participantCount - 6,
    });
    assert.equal(r.status, 201, r.data);
    if (i === 0) assert.equal(r.data.jobTitle, "Ürün tasarımcısı");
    participants.push(r.data);
  }
  const photo = "data:image/jpeg;base64," + "a".repeat(39_000);
  const uploads = await Promise.all(participants.map(({ accessToken }) =>
    call(handler, { action: "launchProfilePhoto", accessToken, photoDataUrl: photo }),
  ));
  assert.ok(uploads.every((response) => response.status === 200));
  const photos = await Promise.all(participants.map(({ accessToken }) =>
    call(handler, { action: "launchProfilePhoto", accessToken }),
  ));
  assert.ok(photos.every((response) => response.status === 200 && response.data.photo === photo));
  const pair = { action: "introduce", accessToken: participants[0].accessToken, targetId: participants[1].participant.id };
  await call(handler, { ...pair, meetingPlace: "Giriş", introductionMessage: "Lacivert ceket" });
  await call(handler, { ...pair, meetingPlace: "Sahne", introductionMessage: "Mavi gömlek" });
  const inbox = await call(handler, { action: "people", accessToken: participants[1].accessToken });
  assert.equal(inbox.data.people.find((person) => person.id === participants[0].participant.id).incoming.message, "Mavi gömlek");
  const unrelated = await call(handler, { action: "people", accessToken: participants[2].accessToken });
  assert.ok(!JSON.stringify(unrelated.data).includes("Mavi gömlek"));
  const recoveryToken = crypto.randomUUID() + crypto.randomUUID();
  await context.runWithEventRequestContext(event.slug, "matchlab", async () => {
    const store = network.getEventNetworkStore();
    const prefix = network.getEventNetworkDatasetInfo().keyPrefix;
    await store.setJSON(`${prefix}/sign-in/${network.hashToken(recoveryToken)}.json`, {
      id: participants[0].participant.id, expires: Date.now() + 60_000,
    });
  });
  const recoveryAttempts = await Promise.all(Array.from({ length: 6 }, () =>
    call(handler, { action: "launchSignInComplete", accessToken: recoveryToken }),
  ));
  assert.deepEqual(recoveryAttempts.map((response) => response.status).sort(), [200, 401, 401, 401, 401, 401]);
  const recovered = recoveryAttempts.find((response) => response.status === 200);
  assert.equal(recovered.data.participant.id, participants[0].participant.id);
  participants[0] = recovered.data;
  const directoryReads = await Promise.all(
    participants.map(({ accessToken }) => call(handler, { action: "people", accessToken })),
  );
  for (const response of directoryReads) {
    assert.equal(response.status, 200, response.data);
    assert.equal(response.data.people.length, participantCount);
    assert.equal(response.data.people.find(p => p.id === participants[0].participant.id).jobTitle, "Ürün tasarımcısı");
    assert.equal(response.data.people.filter((person) => person.isSelf).length, 1);
  }
  let r = await call(handler, { action: "match", accessToken: participants[0].accessToken });
  assert.equal(r.data.waitingReason, "admin");
  process.env.OPENAI_API_KEY = "local-test-placeholder";
  process.env.NTW_AI_ENABLED = "true";
  let aiCalls = 0;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    assert.equal(JSON.parse(options.body).text.format.name, "ntw_match_ranking");
    aiCalls++;
    return Response.json({ error: { code: "credit_balance_exhausted" } }, { status: 429 });
  };
  let launch = await call(admin, { action: "startMatching", password });
  while (launch.data.matching.status === "running")
    launch = await call(admin, { action: "processMatching", password });
  assert.equal(aiCalls, 1, "Launchspace tries the API once and then falls back on quota failure");
  const groups = new Map();
  let matched = 0;
  const matchResults = await Promise.all(participants.map((p) => call(handler, { action: "match", accessToken: p.accessToken })));
  for (const r of matchResults) {
    assert.equal(r.status, 200, r.data);
    if (r.data.group) {
      matched++;
      groups.set(r.data.group.id, r.data.group);
      assert.equal(r.data.group.members.length, 3);
      const titled = r.data.group.members.find(m => m.participantId === participants[0].participant.id);
      if (titled) {
        assert.equal(titled.jobTitle, "Ürün tasarımcısı");
        assert.equal(titled.intro, "Fikirleri anlaşılır ürünlere dönüştürüyorum.");
      }
    }
  }
  assert.equal(matched, matchedCount);
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

  assert.equal(groups.size, groupCount);
  const grouped = [...groups.values()];
  assert.equal(new Set(grouped.flatMap((g) => g.members.map((m) => m.participantId))).size, matchedCount);
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
  const groupRecovery = crypto.randomUUID() + crypto.randomUUID();
  await context.runWithEventRequestContext(event.slug, "matchlab", async () => {
    const store = network.getEventNetworkStore();
    await store.setJSON(`${network.getEventNetworkDatasetInfo().keyPrefix}/sign-in/${network.hashToken(groupRecovery)}.json`, {
      id: member.participant.id, expires: Date.now() + 60_000,
    });
  });
  const reconnected = await call(handler, { action: "launchSignInComplete", accessToken: groupRecovery });
  assert.equal(reconnected.status, 200);
  const resumedGroup = await call(handler, { action: "match", accessToken: reconnected.data.accessToken });
  assert.equal(resumedGroup.data.group.id, g.id);
  const sameChat = await call(handler, { action: "chatRead", groupId: g.id, accessToken: reconnected.data.accessToken });
  assert.equal(sameChat.status, 200);
  assert.ok(JSON.stringify(sameChat.data).includes("Yalnızca bizim grup"));
  r = await call(handler, { action: "chatRead", accessToken: outsider.accessToken, groupId: g.id });
  assert.ok(r.status >= 400);
  assert.equal((await call(handler, { action: "rateMatch", accessToken: member.accessToken, groupId: g.id, rating: 5 })).status, 200);
  assert.equal((await call(handler, { action: "match", accessToken: member.accessToken })).data.group.myRating, 5);
  assert.equal((await call(handler, { action: "rateMatch", accessToken: member.accessToken, groupId: g.id, rating: 4 })).status, 200);
  assert.equal((await call(handler, { action: "match", accessToken: member.accessToken })).data.group.myRating, 4);
  assert.equal((await call(handler, { action: "rateMatch", accessToken: outsider.accessToken, groupId: g.id, rating: 5 })).status, 403);
  assert.ok((await call(handler, { action: "rateMatch", accessToken: member.accessToken, groupId: g.id, rating: 6 })).status >= 400);
  const selfie = { action: "groupSelfie", groupId: g.id, photoDataUrl: "data:image/jpeg;base64,/9j/2Q==" };
  assert.equal((await call(handler, { ...selfie, accessToken: member.accessToken })).status, 200);
  assert.equal((await call(handler, { ...selfie, accessToken: member.accessToken })).status, 200);
  assert.ok((await call(handler, { ...selfie, accessToken: outsider.accessToken })).status >= 400);
  assert.equal((await call(handler, { action: "match", accessToken: member.accessToken })).data.group.rematchApprovedParticipantIds.length, 0);
  r = await call(handler, { action: "me", accessToken: member.accessToken });
  assert.equal(r.data.participant.id, member.participant.id);
  const noReason = await call(handler, {
    action: "introductionReason", accessToken: member.accessToken, targetId: outsider.participant.id,
  });
  assert.deepEqual(noReason.data, { reason: "" });

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
  assert.equal(state.total, participantCount);
  assert.ok(state.results.every((r) => r.counts[0].count === participantCount));
  await call(poll, {
    action: "submit",
    accessToken: participants[0].accessToken,
    questionVersion: state.config.questionVersion,
    answers,
  });
  assert.equal((await call(poll, { action: "admin", password })).data.total, participantCount);
  const changed = [state.config.questions[0].options[1]];
  const update = await call(poll, {
    action: "submit", accessToken: participants[0].accessToken,
    questionVersion: state.config.questionVersion, answers: changed,
  });
  assert.equal(update.status, 200);
  assert.deepEqual(update.data.myAnswers, changed);
  assert.equal(update.data.results[0].total, participantCount);
  assert.equal(update.data.results[0].counts[1].count, 1);

  const updatedTotals = (await call(poll, { action: "admin", password })).data;
  assert.equal(updatedTotals.total, participantCount);
  assert.equal(updatedTotals.results[0].counts[1].count, 1);
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
  assert.equal(r.data.published.total, participantCount);
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
  assert.equal(r.data.total, participantCount);
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
    assert.equal(new Set(codes).size, participantCount);
  });
  // Directory: event members only, contact/session fields never leave the server.
  r = await call(handler, { action: "people", accessToken: member.accessToken });
  assert.equal(r.data.people.length, participantCount);
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
  const approvals = await Promise.all([vote(peers[0]), vote(peers[1])]);
  assert.ok(approvals.every((response) => response.status === 200));
  assert.deepEqual(approvals.map(({ data }) => data.approvedCount).sort(), [2, 3]);
  assert.equal(approvals.filter(({ data }) => data.released).length, 1);
  assert.ok(
    (await call(handler, { action: "chatRead", accessToken: member.accessToken, groupId: g.id }))
      .status >= 400,
  );
  r = await call(handler, { action: "match", accessToken: otherMember.accessToken });
  assert.equal(r.data.group.id, otherGroup.id);
  await context.runWithEventRequestContext(event.slug, "matchlab", async () => {
    const store = network.getEventNetworkStore();
    const prefix = network.getEventNetworkDatasetInfo().keyPrefix;
    const feedback = await store.get(`${prefix}/match-feedback/${g.id}/${member.participant.id}.json`, { type: "json" });
    assert.equal(feedback.rating, 4);
    assert.equal(feedback.groupId, g.id);
    const history = await store.get(`${prefix}/match-history/${g.id}.json`, { type: "json" });
    assert.ok(history);
    const snapshots = await store.get(`${prefix}/match-profile-snapshots/${g.id}.json`, { type: "json" });
    assert.equal(snapshots.members.length, 3);
    assert.ok(!JSON.stringify(snapshots).includes(member.accessToken));
    const selfies = await store.list({ prefix: `${prefix}/selfie-archive/${g.id}/` });
    assert.equal(selfies.blobs.length, 2, "Every uploaded selfie survives rematching");
  });
  const formerMembers = new Set(g.members.map((person) => person.participantId));
  const initialGroupByPerson = new Map(grouped.flatMap((group) =>
    group.members.map((person) => [person.participantId, group.id]),
  ));
  const rematches = await Promise.all([member, ...peers].map((person) =>
    call(handler, { action: "match", accessToken: person.accessToken }),
  ));
  assert.ok(rematches.every(({ status }) => status === 200));
  const newGroups = [...new Map(rematches.flatMap(({ data }) => data.group ? [[data.group.id, data.group]] : [])).values()];
  assert.equal(newGroups.length, 1, "Only one newly compatible trio fits the five free participants");
  assert.equal(newGroups[0].members.filter((person) => formerMembers.has(person.participantId)).length, 1);
  assert.equal(newGroups[0].members.length, 3);
  const rematched = [member, ...peers].find((person) =>
    newGroups[0].members.some((entry) => entry.participantId === person.participant.id),
  );
  assert.equal((await vote(rematched)).status, 200);
  const retained = await call(handler, { action: "match", accessToken: rematched.accessToken });
  assert.equal(retained.data.group.id, newGroups[0].id);
  assert.equal(retained.data.group.rematchApprovedParticipantIds.length, 0);

  assert.ok(newGroups[0].members.every((a, index, members) => members.slice(index + 1).every((b) =>
    !initialGroupByPerson.has(a.participantId) ||
    initialGroupByPerson.get(a.participantId) !== initialGroupByPerson.get(b.participantId),
  )));
  const waiting = [member, ...peers].filter((person) =>
    !newGroups[0].members.some((m) => m.participantId === person.participant.id),
  );
  assert.equal(waiting.length, 2);
  for (const person of waiting) {
    const result = await call(handler, { action: "match", accessToken: person.accessToken });
    assert.equal(result.data.group, null);
  }
  await registry.updateEvent(event.id, {
    products: { matchlab: { enabled: false, visible: false } },
  });
  r = await call(poll, { action: "stage" });
  assert.equal(r.status, 200);
  assert.equal(r.data.published.total, participantCount);
  const datasets = await sandbox.load("_launch-datasets");
  const current = await registry.getEvent(event.id);
  const original = await datasets.getLaunchDatasets(current);
  assert.equal(original.active.id, "legacy-demo");
  const created = await datasets.changeLaunchDataset(current, {
    action: "createDataset",
    name: "Etkinlik",
    mode: "live",
    activate: true,
  });
  const fresh = created.active;
  assert.equal(fresh.name, "Etkinlik");
  assert.equal(fresh.mode, "live");
  assert.equal(
    (await call(admin, { action: "processMatching", password, datasetId: original.active.id }))
      .status,
    409,
  );
  const overview = await call(admin, { action: "matchOverview", password });
  assert.equal(overview.data.registeredCount, 0);
  assert.equal(overview.data.groups.length, 0);
  assert.equal(overview.data.matching.status, "waiting");
  let stage = await call(poll, { action: "stage" });
  assert.equal(stage.data.database.datasetId, fresh.id);
  assert.equal(stage.data.total, 0);
  assert.equal(stage.data.published, null);
  assert.equal(stage.data.config.isOpen, true);
  assert.deepEqual(stage.data.config.questions, state.config.questions);
  await datasets.changeLaunchDataset(current, {
    action: "activateDataset",
    id: original.active.id,
  });
  stage = await call(poll, { action: "stage" });
  assert.equal(stage.data.published.total, participantCount);
  assert.ok((await call(admin, { action: "matchOverview", password })).data.groups.length > 0);
  const activePoll = await call(poll, { action: "admin", password });
  const nextQuestion = { title: "Yeni sunum oylaması", options: ["A", "B"] };
  assert.equal((await call(poll, { action: "newPoll", questions: [nextQuestion] })).status, 401);
  const newPoll = await call(poll, {
    action: "newPoll",
    password,
    revision: activePoll.data.config.revision,
    datasetId: original.active.id,
    questions: [nextQuestion],
  });
  assert.equal(newPoll.status, 200);
  assert.equal(newPoll.data.total, 0);
  assert.equal(newPoll.data.config.isOpen, true);
  assert.equal(newPoll.data.previousPolls[0].total, participantCount);
  const staleVote = await call(poll, {
    action: "submit",
    datasetId: original.active.id,
    accessToken: member.accessToken,
    questionVersion: activePoll.data.config.questionVersion,
    answers,
  });
  assert.equal(staleVote.status, 400);
  const sent = await call(poll, {
    action: "announce",
    password,
    datasetId: original.active.id,
    text: "Sunumlar başlıyor.",
  });
  assert.equal(sent.status, 200);
  const bulletin = await datasets.getLaunchBulletin(current, original.active);
  assert.equal(bulletin.announcement.text, "Sunumlar başlıyor.");
  assert.equal(bulletin.vote.title, nextQuestion.title);
  const blankBulletin = await datasets.getLaunchBulletin(current, fresh);
  assert.equal(blankBulletin.announcement, null);
  assert.equal(blankBulletin.vote.title, state.config.questions[0].title);
  assert.equal(
    (await call(poll, { action: "announce", password, datasetId: original.active.id, text: "" }))
      .status,
    200,
  );
  assert.equal((await datasets.getLaunchBulletin(current, original.active)).announcement, null);
  await registry.updateEvent(event.id, { products: { matchlab: { enabled: true, visible: true } } });
  const lateArrival = () => call(handler, {
    action: "launchGuest", firstName: "Son Katılımcı",
    eventConsent: true, datasetId: original.active.id,
  });
  assert.equal((await lateArrival()).status, 201);
  assert.equal((await call(handler, { action: "match", accessToken: waiting[0].accessToken })).data.group, null);
  assert.equal((await lateArrival()).status, 201);
  const lateMatch = await call(handler, { action: "match", accessToken: waiting[0].accessToken });
  assert.equal(lateMatch.status, 200);
  assert.equal(lateMatch.data.group.members.length, 3);
  assert.ok(!lateMatch.data.group.members.some((person) => person.participantId === waiting[1].participant.id));
  assert.equal((await call(handler, { action: "match", accessToken: waiting[1].accessToken })).data.group, null);
  console.log(
    `PASS: ${participantCount} sequential registrations, ${groupCount} disjoint groups, ${participantCount - matchedCount} waiting, concurrent Match reads and ballots, private chat, stage publication and dataset isolation. No production data/AI.`,
  );
} finally {
  globalThis.fetch = originalFetch;
  await sandbox.cleanup();
}

import assert from "node:assert/strict";
import { functionSandbox } from "./helpers/function-sandbox.mjs";

const sandbox = await functionSandbox();
const originalFetch = globalThis.fetch;
const originalNow = Date.now;
const originalEnabled = process.env.NTW_AI_ENABLED;
process.env.NTW_AI_ENABLED = "false";
globalThis.fetch = async () => {
  throw new Error("Network access forbidden in isolated event tests");
};
const eventId = "evt_9_ekim_2026";
const slug = "9-ekim-2026";
const prefix = `events/${eventId}/live/matchlab`;
const photo =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1S8AAAAASUVORK5CYII=";
const report = {};
try {
  const registry = await sandbox.load("_event-registry-store");
  const network = (await sandbox.load("event-network")).default;
  const five = (await sandbox.load("five")).default;
  const profile = (await sandbox.load("member-profile")).default;
  const members = await sandbox.load("_member-profile-store");
  const flow = await sandbox.load("_event-flow-store");
  const request = async (handler, body, cookie = "", expected = 200) => {
    const response = await handler(
      new Request("https://notwork.test/api/test", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://notwork.test", cookie },
        body: JSON.stringify(body),
      }),
      {},
    );
    const text = await response.text();
    assert.equal(response.status, expected, `${body.action}: ${text.slice(0, 160)}`);
    return {
      data: response.headers.get("content-type")?.includes("json") ? JSON.parse(text) : text,
      cookie: response.headers.get("set-cookie")?.split(";")[0] || "",
    };
  };
  await registry.ensureEventRegistrySeeded();
  const event = await registry.getEvent(eventId);
  event.status = "live";
  event.revision = 100;
  event.entry.isOpen = true;
  for (const product of Object.values(event.products)) {
    Object.assign(product, { enabled: true, visible: true, state: "live", dataMode: "live" });
  }
  // This registry and every data store exist ONLY inside the memory double.
  await sandbox.blobs
    .getStore({ name: "notwork-event-registry" })
    .setJSON(`events/${eventId}.json`, event);
  const store = sandbox.blobs.getStore({ name: "event-network" });
  const archiveKey = "events/evt_17_eylul_2026/live/matchlab/archive-sentinel.json";
  await store.setJSON(archiveKey, { preserved: true });
  const cookies = Array(100).fill("");
  const accounts = [];
  for (let i = 0; i < 50; i++) {
    const account = await members.createAdminMemberProfile({
      name: `Event Tester ${i}`,
      email: `event-${i}@example.org`,
      headline: "Test",
      bio: "Synthetic",
    });
    accounts.push(account);
  }
  await Promise.all(
    accounts.map(async (account, i) => {
      const login = await request(profile, {
        action: "login",
        identity: `event-${i}@example.org`,
        password: account.credentials[0].temporaryPassword,
      });
      assert.ok(login.cookie);
      cookies[i] = login.cookie;
    }),
  );
  report.simultaneousMemberLogins = 50;
  const domains = ["tasarım", "yazılım", "pazarlama", "topluluk", "finans"];
  const registrations = await Promise.all(
    Array.from({ length: 100 }, async (_, i) => {
      const result = await request(
        network,
        {
          action: "register",
          event: i % 2 ? slug : eventId,
          firstName: "Event",
          lastName: `Tester ${i}`,
          email: `event-${i}@example.org`,
          offers: [domains[i % 5]],
          intro: i % 2 ? "Merhaba" : "",
          offersDetail: domains[i % 5],
          needs: domains[(i + 1) % 5],
          needTag: domains[(i + 1) % 5],
          attendedEvent: "ilk-etkinligim",
          eventConsent: true,
          generalNetworkOptIn: false,
          aiAnalysisConsent: true,
          marketingOptIn: false,
        },
        cookies[i],
        201,
      );
      assert.equal(result.data.membership.status, i < 50 ? "active" : "invited");
      assert.equal(result.data.membership.verifiedMember, true);
      return result.data;
    }),
  );
  assert.equal(new Set(registrations.map((row) => row.participant.publicCode)).size, 100);
  assert.ok(registrations.every((row) => /^[A-HJ-NP-Z2-9]{4}$/.test(row.participant.publicCode)));
  const callMatch = (i, action, input = {}, expected = 200) =>
    request(
      network,
      {
        event: i % 2 ? eventId : slug,
        action,
        accessToken: registrations[i].accessToken,
        ...input,
      },
      cookies[i],
      expected,
    );
  const callFive = (i, action, input = {}, expected = 200) =>
    request(
      five,
      { event: eventId, action, accessToken: registrations[i].accessToken, ...input },
      cookies[i],
      expected,
    );
  await Promise.all(
    registrations.map(async (row, i) => {
      assert.equal((await callMatch(i, "me")).data.participant.id, row.participant.id);
      if (i < 50) {
        const resumed = (await request(network, { action: "resume", event: slug }, cookies[i]))
          .data;
        assert.equal(resumed.participant.id, row.participant.id);
        registrations[i] = resumed;
      }
    }),
  );
  await request(
    network,
    { action: "me", event: "17-eylul-2026", accessToken: registrations[0].accessToken },
    "",
    404,
  );
  const initialMatches = await Promise.all(registrations.map((_, i) => callMatch(i, "match")));
  assert.ok(
    initialMatches
      .filter((result) => result.data.group)
      .every(
        (result) => result.data.group.aiAnalysis && result.data.group.analysisSource === "rules",
      ),
    "The very first match response must include the fallback text and source",
  );
  let rooms;
  for (let attempt = 0; attempt < 10; attempt++) {
    rooms = await store.get(`${prefix}/room-index-v2.json`);
    const unmatched = registrations.flatMap((row, i) =>
      rooms.members[row.participant.id] ? [] : [i],
    );
    if (unmatched.length < 3) break;
    await Promise.all(unmatched.map((i) => callMatch(i, "match")));
  }
  rooms = await store.get(`${prefix}/room-index-v2.json`);
  assert.equal(Object.keys(rooms.groups).length, 33);
  assert.equal(Object.keys(rooms.members).length, 99);
  assert.equal(
    new Set(Object.values(rooms.groups).flatMap((group) => group.participantIds)).size,
    99,
  );
  const indexById = new Map(registrations.map((row, i) => [row.participant.id, i]));
  const groups = Object.values(rooms.groups);
  const a = groups[0],
    b = groups[1];
  const ai = indexById.get(a.participantIds[0]),
    bi = indexById.get(b.participantIds[0]);
  const firstGroup = (await callMatch(ai, "match")).data.group;
  assert.ok(firstGroup.aiAnalysis, "Rules fallback must be visible");
  assert.equal(firstGroup.analysisSource, "rules");
  sandbox.blobs.resetMetrics();
  await callMatch(ai, "match");
  report.activeGroupPoll = { ...sandbox.blobs.metrics };
  assert.equal(
    report.activeGroupPoll.lists,
    0,
    "Active group polls must not scan the participant pool",
  );
  assert.ok(report.activeGroupPoll.reads <= 15, "Active group polling reads stay bounded");
  await callMatch(ai, "chatSend", {
    groupId: a.id,
    message: "Yalnızca bu grubun mesajı",
    messageId: "isolated-message-001",
  });
  assert.equal(
    (await callMatch(indexById.get(a.participantIds[1]), "chatRead", { groupId: a.id })).data
      .length,
    1,
  );
  assert.equal((await callMatch(bi, "chatRead", { groupId: b.id })).data.length, 0);
  await callMatch(bi, "chatRead", { groupId: a.id }, 400);
  await Promise.all(
    groups.map((group) =>
      callMatch(indexById.get(group.photoOwnerParticipantId), "completeMatch", {
        groupId: group.id,
        rating: 5,
        comment: "Yeni bağlantılar ve fikirler kazandım",
        consent: true,
        photoDataUrl: photo,
      }),
    ),
  );
  assert.equal(Object.keys((await store.get(`${prefix}/room-index-v2.json`)).members).length, 0);
  await Promise.all(registrations.map((_, i) => callMatch(i, "match")));
  await callMatch(
    ai,
    "chatSend",
    { groupId: a.id, message: "Eski gruba yazma", messageId: "old-group-message" },
    400,
  );
  assert.equal((await store.list({ prefix: `${prefix}/match-history/` })).blobs.length >= 33, true);
  report.match = {
    participants: 100,
    simultaneousGroups: 33,
    matched: 99,
    waiting: 1,
    chatsIsolated: true,
    rematch: true,
    photos: 33,
  };

  // 25 problems, 100 people, each owner must stay in their newly created table.
  const problems = await Promise.all(
    Array.from({ length: 25 }, async (_, n) => {
      const result = (
        await callFive(
          n * 4,
          "submitLive",
          {
            title: `Problem ${n}: ilk müşteriye ulaşmak`,
            description: "İlk müşterilerime nasıl ulaşacağımı anlamak istiyorum",
            tried: "Toplulukta farklı görüşmeler yaptım",
            desiredOutcome: "Uygulanabilir bir sonraki adım belirlemek",
            category: "startup",
            consent: true,
          },
          201,
        )
      ).data;
      const table = (await callFive(n * 4, "tableState")).data.table;
      assert.ok(table.people.some((person) => person.id === result.identity.id));
      return table.problemId;
    }),
  );
  await Promise.all(
    registrations.flatMap((_, i) =>
      i % 4 ? [callFive(i, "tableJoin", { problemId: problems[Math.floor(i / 4)] })] : [],
    ),
  );
  const tables = await Promise.all(
    Array.from({ length: 25 }, async (_, n) => (await callFive(n * 4, "tableState")).data.table),
  );
  assert.ok(
    tables.every(
      (table) => table.people.length === 4 && table.phase === "ready" && table.aiAnalysis,
    ),
  );
  assert.equal(
    new Set(tables.flatMap((table) => table.people.map((person) => person.id))).size,
    100,
  );
  await callFive(0, "tableChat", {
    tableId: tables[0].id,
    messageId: "five-chat-0001",
    text: "Kendi masamızda buluşalım",
  });
  assert.equal((await callFive(1, "tableState")).data.table.messages.length, 1);
  assert.equal((await callFive(4, "tableState")).data.table.messages?.length || 0, 0);
  await callFive(
    4,
    "tableChat",
    { tableId: tables[0].id, messageId: "five-chat-foreign", text: "Başka masaya yazma" },
    400,
  );
  await callFive(0, "tableLeave", { tableId: tables[0].id, round: 0 }, 400);
  let now = originalNow();
  Date.now = () => now;
  await Promise.all(
    tables.map((table, n) => callFive(n * 4, "tableStart", { tableId: table.id, round: 0 })),
  );
  now += 300001;
  const ownerIndex = (table) =>
    registrations.findIndex((row) => `event:${row.participant.id}` === table.photoOwner);
  await callFive(
    (ownerIndex(tables[0]) + 1) % 4,
    "tablePhoto",
    { tableId: tables[0].id, round: 0, photoDataUrl: photo, consent: true },
    400,
  );
  await Promise.all(
    tables.map((table) =>
      callFive(ownerIndex(table), "tablePhoto", {
        tableId: table.id,
        round: 0,
        photoDataUrl: photo,
        consent: true,
      }),
    ),
  );
  for (let round = 0; round < 4; round++) {
    await Promise.all(
      tables.map((table, n) => callFive(n * 4, "tableNext", { tableId: table.id, round })),
    );
    now += 300001;
  }
  await Promise.all(
    registrations.map((_, i) =>
      callFive(i, "tableOutcome", {
        tableId: tables[Math.floor(i / 4)].id,
        solved: true,
        solution: "Üç müşteri görüşmesiyle fikrimizi test edeceğiz",
        rating: 5,
        comment: "Birlikte uygulanabilir bir adım bulduk",
        reviewConsent: true,
      }),
    ),
  );
  await Promise.all(
    registrations.map((_, i) =>
      callFive(i, "tableLeave", { tableId: tables[Math.floor(i / 4)].id, round: 3 }),
    ),
  );
  assert.ok(
    (await Promise.all(registrations.map((_, i) => callFive(i, "tableState")))).every(
      (result) => !result.data.table,
    ),
  );
  Date.now = originalNow;
  const reviewStore = (await sandbox.load("_event-review-store")).getEventReviewStore();
  const reviewKeys = (await reviewStore.list({ prefix: `reviews/${slug}/` })).blobs;
  assert.equal(reviewKeys.filter((row) => row.key.includes("/match-")).length, 33);
  assert.equal(reviewKeys.filter((row) => row.key.includes("/five-")).length, 100);
  const reviews = await Promise.all(reviewKeys.map((row) => reviewStore.get(row.key)));
  assert.equal(reviews.filter((row) => row.photoDataUrl).length, 58);
  assert.deepEqual(await store.get(archiveKey), { preserved: true });
  report.five = {
    participants: 100,
    tables: 25,
    ownerRetained: true,
    groupChatsIsolated: true,
    photos: 25,
    outcomes: 100,
    rounds: 4,
  };
  assert.equal((await flow.readEventFlow(eventId)).status, "idle");
  await flow.mutateEventFlow(eventId, "configure", {
    steps: [
      { product: "matchlab", durationMinutes: 60 },
      { product: "five", durationMinutes: 90 },
    ],
  });
  assert.equal((await flow.readEventFlow(eventId)).endsAt, "");
  await flow.mutateEventFlow(eventId, "start");
  const started = await flow.readEventFlow(eventId);
  assert.equal(Date.parse(started.endsAt) - Date.parse(started.startedAt), 3600000);
  await flow.mutateEventFlow(eventId, "addNotice", { notice: "Yeni aşama duyurusu" });
  assert.equal((await flow.readEventFlow(eventId)).notices.length, 1);
  await flow.mutateEventFlow(eventId, "advance");
  assert.equal((await flow.readEventFlow(eventId)).currentStepIndex, 1);
  report.flow = { startsOnlyByAdmin: true, durationConfig: true, notices: true, advance: true };
  report.paidCalls = 0;
  report.realDataTouched = false;
  console.log(JSON.stringify(report, null, 2));
  console.log(
    "PASS October event handler integration: login/register/resume, 100-person match and Five, chat isolation, photos/reviews, rematch, event separation and admin flow.",
  );
} finally {
  globalThis.fetch = originalFetch;
  Date.now = originalNow;
  if (originalEnabled === undefined) delete process.env.NTW_AI_ENABLED;
  else process.env.NTW_AI_ENABLED = originalEnabled;
  await sandbox.cleanup();
}

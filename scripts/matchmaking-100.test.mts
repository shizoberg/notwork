import { test } from "node:test";
import assert from "node:assert/strict";
import {
  scorePair,
  selectMatchCandidates,
  type MatchableRegistration,
} from "../netlify/functions/_matchmaking.mts";

const domains = [
  "tasarım",
  "yazılım",
  "veri",
  "pazarlama",
  "ürün",
  "girişim",
  "içerik",
  "topluluk",
  "finans",
  "kariyer",
];

type TestRegistration = MatchableRegistration & {
  profile: Record<string, unknown>;
  participant: MatchableRegistration["participant"] & Record<string, unknown>;
  intro: string;
  offersDetail: string;
};

function person(index: number): TestRegistration {
  const offer = domains[index % domains.length];
  const need = domains[(index * 3 + 2) % domains.length];
  const id = `person-${String(index).padStart(3, "0")}`;
  return {
    profile: {
      id,
      username: id,
      firstName: "Kişi",
      lastName: String(index),
      email: `${id}@example.invalid`,
      emailNormalized: `${id}@example.invalid`,
      attendedEvent: "17-eylul-2026",
      generalNetworkOptIn: true,
      marketingOptIn: false,
      createdAt: "2026-09-15T00:00:00.000Z",
      updatedAt: "2026-09-15T00:00:00.000Z",
    },
    participant: {
      id,
      eventId: "load-test",
      networkProfileId: id,
      publicCode: `T${String(index).padStart(3, "0")}`,
      accessTokenHash: "",
      status: "registered",
      registeredAt: "2026-09-15T00:00:00.000Z",
      updatedAt: "2026-09-15T00:00:00.000Z",
    },
    offers: [offer, index % 2 ? "fikir geliştirme" : "iletişim"],
    intro: `${offer} alanında çalışıyorum`,
    offersDetail: `${offer} konusunda destek olabilirim`,
    needs: `${need} konusunda doğru insanı arıyorum`,
    needTag: need,
  };
}

test("100 kişilik havuzda doğru katkı, çeşitlilik ve tekrar kontrolü", () => {
  const people = Array.from({ length: 100 }, (_, index) => person(index));
  let coveredNeeds = 0;
  let selectedScore = 0;
  let baselineScore = 0;
  let repeatSelections = 0;

  for (const current of people) {
    const candidates = people.filter(
      (candidate) => candidate.participant.id !== current.participant.id,
    );
    const firstRound = selectMatchCandidates(current, candidates, new Set(), 1);
    assert.equal(firstRound.length, 2);
    const target = current.needTag;
    if (firstRound.some((candidate) => candidate.row.offers.includes(target))) coveredNeeds += 1;
    selectedScore += firstRound.reduce(
      (total, candidate) => total + scorePair(current, candidate.row),
      0,
    );

    const baseline = [
      candidates[(Number(current.participant.id.slice(-3)) * 17 + 11) % candidates.length],
      candidates[(Number(current.participant.id.slice(-3)) * 29 + 23) % candidates.length],
    ];
    baselineScore += baseline.reduce(
      (total, candidate) => total + scorePair(current, candidate),
      0,
    );

    const seen = new Set(firstRound.map((candidate) => candidate.row.participant.id));
    const secondRound = selectMatchCandidates(current, candidates, seen, 2);
    assert.equal(secondRound.length, 2);
    repeatSelections += secondRound.filter((candidate) =>
      seen.has(candidate.row.participant.id),
    ).length;
  }

  assert.ok(coveredNeeds >= 95, `ihtiyaç karşılama düşük: ${coveredNeeds}/100`);
  assert.ok(selectedScore > baselineScore * 2, `${selectedScore} <= ${baselineScore} x 2`);
  assert.equal(repeatSelections, 0);

  const remaining = [...people];
  const assigned = new Set<string>();
  const groups: string[][] = [];
  while (remaining.length >= 3) {
    const current = remaining.shift()!;
    const picked = selectMatchCandidates(current, remaining, new Set(), groups.length + 1);
    assert.equal(picked.length, 2);
    const ids = [
      current.participant.id,
      ...picked.map((candidate) => candidate.row.participant.id),
    ];
    ids.forEach((id) => {
      assert.ok(!assigned.has(id), `${id} birden fazla grupta`);
      assigned.add(id);
    });
    groups.push(ids);
    const pickedIds = new Set(ids.slice(1));
    for (let index = remaining.length - 1; index >= 0; index -= 1) {
      if (pickedIds.has(remaining[index].participant.id)) remaining.splice(index, 1);
    }
  }

  assert.equal(groups.length, 33);
  assert.equal(assigned.size, 99);
  assert.equal(remaining.length, 1);
  console.log(
    JSON.stringify({
      participants: 100,
      groups: groups.length,
      coveredNeeds,
      repeatSelections,
      selectedScore,
      baselineScore,
    }),
  );
});

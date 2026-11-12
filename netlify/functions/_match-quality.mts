import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { assessMatchQuality, type MatchQualityGroup } from "../../src/lib/match-quality.ts";

type Store = ReturnType<typeof getStore>;
type EventInfo = { id: string; slug: string; shortTitle: string };
type ArchiveGroup = {
  id: string;
  groupName?: string;
  participantIds: string[];
  round: number;
  score: number;
  generatedAt: string;
};
type ScoreRecord = { rating: number; modelImprovement?: boolean };

function validScore(record: ScoreRecord | null) {
  return record && Number.isInteger(record.rating) && record.rating >= 1 && record.rating <= 5
    ? record.rating
    : undefined;
}

export function matchFeedbackKey(prefix: string, groupId: string, participantId: string) {
  return `${prefix}/match-feedback/${groupId}/${participantId}.json`;
}

async function readBatches<T, R>(items: T[], read: (item: T) => Promise<R>) {
  const result: R[] = [];
  for (let start = 0; start < items.length; start += 24) {
    result.push(...(await Promise.all(items.slice(start, start + 24).map(read))));
  }
  return result;
}

export async function getMatchQuality(network: Store, reviews: Store, events: EventInfo[]) {
  const eventById = new Map(events.map((event) => [event.id, event]));
  const legacyEvent = events.find((event) => event.slug === "21-agustos-2026");
  const archives: { key: string; prefix: string; event: EventInfo }[] = [];
  const directKeys = new Set<string>();
  const localReviewKeys = new Set<string>();
  for await (const { blobs } of network.list({ prefix: "events/", paginate: true })) {
    for (const { key } of blobs) {
      const match = key.match(
        /^(events\/([^/]+)\/(?:live\/matchlab|launch-datasets\/[^/]+\/live\/matchlab|network))\/(match-history|match-feedback|reviews)\//,
      );
      if (!match) continue;
      const [, prefix, id, kind] = match;
      const event = id === "21agustoscanli" ? legacyEvent : eventById.get(id);
      if (!event) continue;
      if (kind === "match-history") archives.push({ key, prefix, event });
      if (kind === "match-feedback") directKeys.add(key);
      if (kind === "reviews") localReviewKeys.add(key);
    }
  }
  const reviewKeys = new Set<string>();
  for await (const { blobs } of reviews.list({ prefix: "reviews/", paginate: true })) {
    for (const { key } of blobs) if (/\/match-[a-f0-9]{64}\.json$/.test(key)) reviewKeys.add(key);
  }
  const stored = await readBatches(archives, async (archive) => ({
    ...archive,
    group: (await network.get(archive.key, { type: "json" })) as ArchiveGroup | null,
  }));
  const groups = new Map<string, MatchQualityGroup>();
  const records = new Map<string, Promise<ScoreRecord | null>>();
  function readScore(store: Store, key: string) {
    if (!records.has(key))
      records.set(key, store.get(key, { type: "json" }) as Promise<ScoreRecord | null>);
    return records.get(key)!;
  }
  await readBatches(stored, async ({ event, prefix, group }) => {
    if (
      !group?.id ||
      !Array.isArray(group.participantIds) ||
      !Number.isFinite(group.score) ||
      !Number.isFinite(group.round)
    )
      return;
    const row: MatchQualityGroup = {
      id: group.id,
      eventId: event.id,
      name: group.groupName || "Match grubu",
      round: group.round,
      ruleScore: group.score,
      date: group.generatedAt || "",
      direct: [],
      eventRatings: [],
      training: [],
    };
    for (const person of new Set(group.participantIds)) {
      const directKey = matchFeedbackKey(prefix, group.id, person);
      if (directKeys.has(directKey)) {
        const record = await readScore(network, directKey);
        const score = validScore(record);
        if (score !== undefined) {
          row.direct.push(score);
          if (record?.modelImprovement === true) row.training.push(score);
        }
      }
      const hash = createHash("sha256").update(`${group.id}:${person}`).digest("hex");
      const localKey = `${prefix}/reviews/${hash}.json`;
      const legacyKey = `reviews/${event.slug}/match-${hash}.json`;
      const source = localReviewKeys.has(localKey)
        ? await readScore(network, localKey)
        : reviewKeys.has(legacyKey)
          ? await readScore(reviews, legacyKey)
          : null;
      const score = validScore(source);
      if (score !== undefined) row.eventRatings.push(score);
    }
    const key = `${row.eventId}:${row.id}`;
    const previous = groups.get(key);
    if (
      !previous ||
      row.direct.length + row.eventRatings.length >
        previous.direct.length + previous.eventRatings.length
    )
      groups.set(key, row);
  });
  const result = assessMatchQuality([...groups.values()]);
  return { ...result, events: events.map(({ id, shortTitle }) => ({ id, title: shortTitle })) };
}

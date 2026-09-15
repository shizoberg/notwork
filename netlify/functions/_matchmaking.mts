import { createHash } from "node:crypto";

export type MatchableRegistration = {
  participant: { id: string };
  offers: string[];
  needs: string;
  needTag: string;
};

export type ScoredMatchCandidate<T extends MatchableRegistration> = {
  row: T;
  score: number;
  seen: boolean;
  tie: number;
};

const ignoredTokens = new Set([
  "ama",
  "bir",
  "icin",
  "için",
  "ile",
  "olan",
  "olarak",
  "veya",
  "yeni",
  "destek",
  "yardim",
  "yardım",
  "ariyorum",
  "arıyorum",
  "istiyorum",
]);

const concepts: Record<string, string[]> = {
  design: ["tasarım", "designer", "design", "ux", "ui", "görsel", "marka"],
  software: ["yazılım", "developer", "frontend", "backend", "mobil", "kod", "teknoloji"],
  data: ["veri", "data", "analiz", "analitik", "yapay", "zeka", "ai", "otomasyon"],
  growth: ["pazarlama", "marketing", "satış", "sales", "büyüme", "growth", "müşteri"],
  product: ["ürün", "product", "strateji", "araştırma", "kullanıcı"],
  startup: ["girişim", "startup", "kurucu", "iş", "işbirliği", "ortak"],
  creative: ["içerik", "content", "kreatif", "yaratıcı", "sanat", "fotoğraf", "video", "müzik"],
  community: ["topluluk", "community", "network", "networking", "etkinlik", "organizasyon"],
  finance: ["yatırım", "yatırımcı", "finans", "fon", "bütçe", "muhasebe"],
  people: ["kariyer", "mentor", "mentorluk", "insan", "ik", "liderlik", "ekip"],
};

const conceptByToken = new Map(
  Object.entries(concepts).flatMap(([concept, aliases]) =>
    aliases.map((alias) => [alias, concept] as const),
  ),
);

function tokenize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !ignoredTokens.has(token));
}

function signals(value: string | string[]) {
  const tokens = new Set(tokenize(Array.isArray(value) ? value.join(" ") : value));
  const matchedConcepts = new Set(
    [...tokens].map((token) => conceptByToken.get(token)).filter(Boolean) as string[],
  );
  return { tokens, concepts: matchedConcepts };
}

function overlap(source: ReturnType<typeof signals>, target: ReturnType<typeof signals>) {
  const exact = [...source.tokens].filter((token) => target.tokens.has(token)).length;
  const conceptual = [...source.concepts].filter((concept) => target.concepts.has(concept)).length;
  return exact * 3 + conceptual * 2;
}

export function scorePair<T extends MatchableRegistration>(current: T, candidate: T) {
  const currentNeeds = signals(`${current.needs} ${current.needTag}`);
  const candidateNeeds = signals(`${candidate.needs} ${candidate.needTag}`);
  const currentOffers = signals(current.offers);
  const candidateOffers = signals(candidate.offers);
  const directFit = overlap(currentNeeds, candidateOffers);
  const reciprocalFit = overlap(candidateNeeds, currentOffers);
  const sharedLanguage = overlap(currentOffers, candidateOffers);
  const complementary = directFit > 0 && reciprocalFit > 0 ? 10 : directFit > 0 ? 5 : 0;
  return 1 + directFit * 8 + reciprocalFit * 6 + Math.min(sharedLanguage, 5) + complementary;
}

export function stableTieBreaker(currentId: string, candidateId: string, round: number) {
  const hash = createHash("sha256")
    .update(`${currentId}:${candidateId}:${round}`)
    .digest("hex")
    .slice(0, 8);
  return Number.parseInt(hash, 16);
}

function offerDiversity<T extends MatchableRegistration>(first: T, second: T) {
  const firstSignals = signals(first.offers);
  const secondSignals = signals(second.offers);
  const sharedConcepts = [...firstSignals.concepts].filter((concept) =>
    secondSignals.concepts.has(concept),
  ).length;
  const combinedConcepts = new Set([...firstSignals.concepts, ...secondSignals.concepts]).size;
  return combinedConcepts * 3 - sharedConcepts * 4;
}

export function selectMatchCandidates<T extends MatchableRegistration>(
  current: T,
  rows: T[],
  seenParticipantIds: Set<string>,
  round: number,
) {
  const ranked: ScoredMatchCandidate<T>[] = rows
    .map((row) => ({
      row,
      score: scorePair(current, row),
      seen: seenParticipantIds.has(row.participant.id),
      tie: stableTieBreaker(current.participant.id, row.participant.id, round),
    }))
    .sort((first, second) => {
      if (first.seen !== second.seen) return first.seen ? 1 : -1;
      if (second.score !== first.score) return second.score - first.score;
      return first.tie - second.tie;
    });

  const unseenCount = ranked.filter((candidate) => !candidate.seen).length;
  const pool = ranked.slice(0, Math.min(ranked.length, Math.max(18, Math.min(32, unseenCount))));
  let best: {
    candidates: [ScoredMatchCandidate<T>, ScoredMatchCandidate<T>];
    score: number;
  } | null = null;

  for (let firstIndex = 0; firstIndex < pool.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < pool.length; secondIndex += 1) {
      const first = pool[firstIndex];
      const second = pool[secondIndex];
      const repeatPenalty = (first.seen ? 1_000 : 0) + (second.seen ? 1_000 : 0);
      const score =
        first.score +
        second.score +
        scorePair(first.row, second.row) * 0.35 +
        Math.min(first.score, second.score) * 0.2 +
        offerDiversity(first.row, second.row) -
        repeatPenalty;
      const bestTie = best ? best.candidates[0].tie + best.candidates[1].tie : Infinity;
      if (
        !best ||
        score > best.score ||
        (score === best.score && first.tie + second.tie < bestTie)
      ) {
        best = { candidates: [first, second], score };
      }
    }
  }
  return best?.candidates || [];
}

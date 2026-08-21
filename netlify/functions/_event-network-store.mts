import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";

type EventNetworkProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailNormalized: string;
  generalNetworkOptIn: boolean;
  marketingOptIn: boolean;
  createdAt: string;
  updatedAt: string;
};

type EventParticipant = {
  id: string;
  eventId: string;
  networkProfileId: string;
  publicCode: string;
  accessTokenHash: string;
  status: "registered" | "excluded";
  registeredAt: string;
  updatedAt: string;
};

type EventNetworkRegistration = {
  profile: EventNetworkProfile;
  participant: EventParticipant;
  offers: string[];
  needs: string;
  needTag: string;
  accessToken?: string;
};

type NetworkMemberRow = {
  id: string;
  name: string;
  title: string;
  skills: string;
  email: string;
  instagram: string;
  linkedin: string;
  motivation: string;
  contact: string;
  createdAt: string;
  username: string;
  consentAt: string;
};

type EventNetworkPresence = "open" | "meeting" | "paused";

type EventNetworkMatchMember = {
  participantId: string;
  publicCode: string;
  name: string;
  offers: string[];
  needs: string;
  needTag: string;
  presence: EventNetworkPresence;
  isCurrentUser: boolean;
  isDone?: boolean;
  isPhotoOwner?: boolean;
};

type EventNetworkMatchGroup = {
  id: string;
  groupSize: number;
  round: number;
  score: number;
  reason: string;
  members: EventNetworkMatchMember[];
  conversationPrompt: string;
  conversationPrompts?: string[];
  photoOwnerParticipantId?: string;
  generatedAt: string;
};

type StoredActiveMatch = {
  id: string;
  round: number;
  score: number;
  reason: string;
  participantIds: string[];
  conversationPrompts: string[];
  photoOwnerParticipantId?: string;
  generatedAt: string;
  completedParticipantIds?: string[];
  completedAtByParticipantId?: Record<string, string>;
};

export type NetworkInput = {
  action?: string;
  accessToken?: string;
  presence?: EventNetworkPresence;
  firstName?: string;
  lastName?: string;
  email?: string;
  offers?: string[];
  needs?: string;
  needTag?: string;
  rating?: number;
  comment?: string;
  photoDataUrl?: string;
  consent?: boolean;
  eventConsent?: boolean;
  generalNetworkOptIn?: boolean;
  marketingOptIn?: boolean;
};

export type NetworkAdminInput = {
  password?: string;
  action?: "list" | "resetDemo";
};

const eventId = "21-agustos-2026";
const storeName = "event-network";
const demoDatasetCode = "21agustos-demo";
const liveDatasetCode = "21agustoscanli";
const datasetCode =
  process.env.EVENT_NETWORK_DATASET?.trim() ||
  process.env.NETLIFY_EVENT_NETWORK_DATASET?.trim() ||
  liveDatasetCode;
const datasetPrefix = `events/${datasetCode}/network`;
const codeLetters = "ABCDEFGHJKLMNPQRSTUVWXYZ";

export function getEventNetworkStore() {
  return getStore({ name: storeName, consistency: "strong" });
}

export function getEventNetworkDatasetInfo() {
  return {
    storeName,
    datasetCode,
    activeDatabaseCode: datasetCode,
    demoDatabaseCode: demoDatasetCode,
    liveDatabaseCode: liveDatasetCode,
    keyPrefix: datasetPrefix,
    mode: datasetCode === liveDatasetCode ? "live" : "demo",
  };
}

export async function resetDemoEventNetworkDataset(store: ReturnType<typeof getEventNetworkStore>) {
  if (getEventNetworkDatasetInfo().mode !== "demo") {
    throw new Error("Demo reset sadece demo database üzerinde çalışır");
  }
  const { blobs } = await store.list({ prefix: `${datasetPrefix}/` });
  await Promise.all(blobs.map((blob) => store.delete(blob.key)));
}

export function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

export function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function profileKey(emailNormalized: string) {
  return `${datasetPrefix}/profiles/${encodeURIComponent(emailNormalized)}.json`;
}

function participantKey(participantId: string) {
  return `${datasetPrefix}/participants/${participantId}.json`;
}

function codeKey(publicCode: string) {
  return `${datasetPrefix}/codes/${publicCode}.json`;
}

function tokenKey(tokenHash: string) {
  return `${datasetPrefix}/tokens/${tokenHash}.json`;
}

function detailKey(participantId: string) {
  return `${datasetPrefix}/details/${participantId}.json`;
}

function presenceKey(participantId: string) {
  return `${datasetPrefix}/presence/${participantId}.json`;
}

function matchCursorKey(participantId: string) {
  return `${datasetPrefix}/match-cursors/${participantId}.json`;
}

function activeMatchKey(participantId: string) {
  return `${datasetPrefix}/active-matches/${participantId}.json`;
}

function normalizeOffers(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => clean(item, 36).toLocaleLowerCase("tr-TR"))
    .filter(Boolean)
    .slice(0, 3);
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
}

function generalMemberKey(username: string) {
  return `members/${username}.json`;
}

async function upsertGeneralNetworkingMember(registration: EventNetworkRegistration) {
  if (!registration.profile.generalNetworkOptIn) return;

  const store = getStore({ name: "networking-members", consistency: "strong" });
  const baseUsername =
    slugify(displayName(registration)) || `notwork-${registration.participant.publicCode}`;
  let username = baseUsername;
  const existing = (await store.get(generalMemberKey(username), {
    type: "json",
    consistency: "strong",
  })) as NetworkMemberRow | null;

  if (
    existing &&
    existing.email.toLocaleLowerCase("tr-TR") !== registration.profile.emailNormalized
  ) {
    username = `${baseUsername}-${hashToken(registration.profile.emailNormalized).slice(0, 4)}`;
  }

  const member: NetworkMemberRow = {
    id: existing?.id || registration.profile.id,
    name: displayName(registration),
    title: registration.needTag
      ? `21 Ağustos katılımcısı · ${registration.needTag}`
      : "21 Ağustos notwork katılımcısı",
    skills: registration.offers.join(", "),
    email: registration.profile.email,
    instagram: existing?.instagram || "",
    linkedin: existing?.linkedin || "",
    motivation: registration.needs,
    contact: registration.profile.email,
    createdAt: existing?.createdAt || registration.profile.createdAt,
    username,
    consentAt: registration.profile.updatedAt,
  };

  await Promise.all([
    store.setJSON(generalMemberKey(username), member),
    store.setJSON(`backups/latest/${username}.json`, {
      ...member,
      backupReason: "event-network-sync",
      backedUpAt: new Date().toISOString(),
    }),
    store.setJSON(
      `backups/immutable/${username}/${Date.now()}-${crypto.randomUUID()}-event-network-sync.json`,
      {
        ...member,
        backupReason: "event-network-sync",
        backedUpAt: new Date().toISOString(),
      },
    ),
  ]);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function nextPublicCode(store: ReturnType<typeof getEventNetworkStore>) {
  const { blobs } = await store.list({ prefix: `${datasetPrefix}/codes/` });
  const used = new Set(
    blobs
      .map((blob) => blob.key.split("/").pop()?.replace(".json", ""))
      .filter(Boolean) as string[],
  );

  for (let index = 1; index < 999; index += 1) {
    const letter = codeLetters[(index - 1) % codeLetters.length];
    const number = Math.ceil(index / codeLetters.length);
    const code = `${letter}${String(number).padStart(2, "0")}`;
    if (!used.has(code)) return code;
  }
  throw new Error("Etkinlik kodu üretilemedi");
}

async function getJsonRows<T>(store: ReturnType<typeof getEventNetworkStore>, prefix: string) {
  const { blobs } = await store.list({ prefix });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );
  return rows.filter(Boolean) as T[];
}

function displayName(registration: EventNetworkRegistration) {
  return `${registration.profile.firstName} ${registration.profile.lastName}`
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function scorePair(current: EventNetworkRegistration, candidate: EventNetworkRegistration) {
  const currentNeedTokens = new Set(tokenize(`${current.needs} ${current.needTag}`));
  const candidateNeedTokens = new Set(tokenize(`${candidate.needs} ${candidate.needTag}`));
  const currentOffers = current.offers.flatMap(tokenize);
  const candidateOffers = candidate.offers.flatMap(tokenize);

  const directHits = candidateOffers.filter((token) => currentNeedTokens.has(token)).length;
  const reciprocalHits = currentOffers.filter((token) => candidateNeedTokens.has(token)).length;
  const tagHit = candidate.offers.some((offer) => offer.includes(current.needTag)) ? 2 : 0;
  const reverseTagHit = current.offers.some((offer) => offer.includes(candidate.needTag)) ? 1 : 0;

  return directHits * 6 + reciprocalHits * 3 + tagHit + reverseTagHit + 1;
}

function stableTieBreaker(currentId: string, candidateId: string, round: number) {
  const hash = hashToken(`${currentId}:${candidateId}:${round}`).slice(0, 8);
  return Number.parseInt(hash, 16);
}

function pickGroupSize(_publicCode: string, _round: number, availableCount: number) {
  return availableCount >= 2 ? 3 : 0;
}

const icebreakerQuestions = [
  "Bu etkinlikten tek bir bağlantıyla ayrılsan, o kişi sana hangi konuda iyi gelsin?",
  "Şu an üzerinde çalıştığın veya değiştirmek istediğin en gerçek şey ne?",
  "Son dönemde yaptığın en öğretici hata neydi?",
  "Birine hemen destek olabileceğin konu ne?",
  "Bu ay çözmeye çalıştığın en net problem ne?",
  "Seni burada tanıyan biri seni hangi konuda hatırlasın?",
  "Birlikte küçük bir şey deneyecek olsanız ilk adım ne olurdu?",
  "Bugün tanışacağın kişilerden ne öğrenmek istiyorsun?",
];

function pickIcebreakers(groupId: string) {
  return [...icebreakerQuestions]
    .map((question, index) => ({
      question,
      order: stableTieBreaker(groupId, question, index + 1),
    }))
    .sort((first, second) => first.order - second.order)
    .slice(0, 3)
    .map((item) => item.question);
}

function pickPhotoOwnerParticipantId(groupId: string, participantIds: string[]) {
  const index =
    stableTieBreaker(groupId, participantIds.join(":"), participantIds.length) %
    participantIds.length;
  return participantIds[index];
}

async function saveMatchLabReview(
  registration: EventNetworkRegistration,
  input: NetworkInput,
  requiresPhoto: boolean,
) {
  const rating = Math.round(Number(input.rating));
  const comment = clean(input.comment, 700);
  const photoDataUrl = clean(input.photoDataUrl, 1_100_000);

  if (!input.consent) throw new Error("Yorum ve fotoğraf için KVKK onayı gerekli");
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error("Puan 1-5 arasında olmalı");
  }
  if (!comment) throw new Error("Etkinlik yorumu gerekli");
  if (photoDataUrl && !photoDataUrl.startsWith("data:image/")) {
    throw new Error("Geçersiz fotoğraf");
  }
  if (requiresPhoto && !photoDataUrl) {
    throw new Error("Bu grupta fotoğraf görevi sende. Ortam veya selfie fotoğrafı eklemelisin.");
  }

  const now = new Date().toISOString();
  const review = {
    id: crypto.randomUUID(),
    eventId: "21-agustos-2026",
    eventTitle: "21 Ağustos notwork · House of Rene Lokal",
    name: displayName(registration) || "notwork katılımcısı",
    rating,
    comment,
    photoDataUrl,
    privateNote: requiresPhoto
      ? `Match Lab fotoğraf sorumlusu · kod: ${registration.participant.publicCode}`
      : `Match Lab grup yorumu · kod: ${registration.participant.publicCode}`,
    consentAt: now,
    createdAt: now,
  };
  const reviewStore = getStore({ name: "event-reviews", consistency: "strong" });
  await reviewStore.setJSON(`reviews/21-agustos-2026/${Date.now()}-${review.id}.json`, review);
}

async function getPresenceMap(
  store: ReturnType<typeof getEventNetworkStore>,
  rows: EventNetworkRegistration[],
) {
  const entries = await Promise.all(
    rows.map(async (row) => {
      const value = (await store.get(presenceKey(row.participant.id), {
        type: "json",
        consistency: "strong",
      })) as { presence?: EventNetworkPresence } | null;
      return [row.participant.id, value?.presence || "open"] as const;
    }),
  );
  return new Map(entries);
}

function toMatchMember(
  registration: EventNetworkRegistration,
  presence: EventNetworkPresence,
  isCurrentUser: boolean,
  isDone = false,
  isPhotoOwner = false,
): EventNetworkMatchMember {
  return {
    participantId: registration.participant.id,
    publicCode: registration.participant.publicCode,
    name: displayName(registration),
    offers: registration.offers,
    needs: registration.needs,
    needTag: registration.needTag,
    presence,
    isCurrentUser,
    isDone,
    isPhotoOwner,
  };
}

function buildReason(current: EventNetworkRegistration, members: EventNetworkRegistration[]) {
  const otherTags = members
    .filter((member) => member.participant.id !== current.participant.id)
    .flatMap((member) => member.offers)
    .slice(0, 4);
  const tags = otherTags.length ? otherTags.join(", ") : "tamamlayıcı konular";
  return `${current.needTag || "ihtiyacın"} konusu için ${tags} başlıklarında destek alabileceğin bir grup.`;
}

async function readCursor(store: ReturnType<typeof getEventNetworkStore>, participantId: string) {
  const cursor = (await store.get(matchCursorKey(participantId), {
    type: "json",
    consistency: "strong",
  })) as { round?: number; seen?: string[] } | null;
  return { round: cursor?.round || 0, seen: new Set(cursor?.seen || []) };
}

async function writeCursor(
  store: ReturnType<typeof getEventNetworkStore>,
  participantId: string,
  round: number,
  seen: Set<string>,
) {
  await store.setJSON(matchCursorKey(participantId), {
    round,
    seen: [...seen].slice(-40),
    updatedAt: new Date().toISOString(),
  });
}

async function getActiveMatch(
  store: ReturnType<typeof getEventNetworkStore>,
  participantId: string,
) {
  return (await store.get(activeMatchKey(participantId), {
    type: "json",
    consistency: "strong",
  })) as StoredActiveMatch | null;
}

async function hasActiveMatch(
  store: ReturnType<typeof getEventNetworkStore>,
  participantId: string,
) {
  return Boolean(await getActiveMatch(store, participantId));
}

async function writeActiveMatch(
  store: ReturnType<typeof getEventNetworkStore>,
  match: StoredActiveMatch,
) {
  await Promise.all(
    match.participantIds.map((participantId) =>
      store.setJSON(activeMatchKey(participantId), match),
    ),
  );
}

async function buildActiveMatchGroup(
  store: ReturnType<typeof getEventNetworkStore>,
  match: StoredActiveMatch,
  current: EventNetworkRegistration,
  presenceMap: Map<string, EventNetworkPresence>,
) {
  const doneParticipantIds = new Set(match.completedParticipantIds || []);
  const rows = (
    await Promise.all(
      match.participantIds.map((participantId) =>
        store.get(participantKey(participantId), { type: "json", consistency: "strong" }),
      ),
    )
  ).filter(Boolean) as EventNetworkRegistration[];

  return {
    id: match.id,
    groupSize: rows.length,
    round: match.round,
    score: match.score,
    reason: match.reason,
    members: rows.map((registration) =>
      toMatchMember(
        registration,
        presenceMap.get(registration.participant.id) || "meeting",
        registration.participant.id === current.participant.id,
        doneParticipantIds.has(registration.participant.id),
        match.photoOwnerParticipantId === registration.participant.id,
      ),
    ),
    conversationPrompt: match.conversationPrompts[0] || icebreakerQuestions[0],
    conversationPrompts: match.conversationPrompts,
    photoOwnerParticipantId: match.photoOwnerParticipantId,
    generatedAt: match.generatedAt,
  } satisfies EventNetworkMatchGroup;
}

export async function registerNetworkProfile(
  store: ReturnType<typeof getEventNetworkStore>,
  input: NetworkInput,
) {
  const now = new Date().toISOString();
  const email = clean(input.email, 120);
  const emailNormalized = normalizeEmail(email);
  const firstName = clean(input.firstName, 50);
  const lastName = clean(input.lastName, 50);
  const offers = normalizeOffers(input.offers);
  const needs = clean(input.needs, 220);
  const needTag = clean(input.needTag, 40).toLocaleLowerCase("tr-TR");

  if (!firstName || !lastName) throw new Error("Ad ve soyad gerekli");
  if (!isValidEmail(emailNormalized)) throw new Error("Geçerli e-posta gerekli");
  if (offers.length === 0) throw new Error("En az bir yardımcı olabileceğin konu gerekli");
  if (!needs) throw new Error("Destek aradığın konu gerekli");
  if (!input.eventConsent) throw new Error("Etkinlik eşleştirmesi için onay gerekli");

  const existing = (await store.get(profileKey(emailNormalized), {
    type: "json",
    consistency: "strong",
  })) as EventNetworkRegistration | null;
  if (existing) {
    const accessToken = crypto.randomUUID();
    const accessTokenHash = hashToken(accessToken);
    const profile: EventNetworkProfile = {
      ...existing.profile,
      firstName,
      lastName,
      email,
      emailNormalized,
      generalNetworkOptIn: Boolean(
        input.generalNetworkOptIn || existing.profile.generalNetworkOptIn,
      ),
      marketingOptIn: Boolean(input.marketingOptIn || existing.profile.marketingOptIn),
      updatedAt: now,
    };
    const participant: EventParticipant = {
      ...existing.participant,
      accessTokenHash,
      updatedAt: now,
    };
    const registration: EventNetworkRegistration = {
      ...existing,
      profile,
      participant,
      offers,
      needs,
      needTag,
      accessToken,
    };
    const storedRegistration = { ...registration, accessToken: undefined };

    await Promise.all([
      store.setJSON(profileKey(emailNormalized), storedRegistration),
      store.setJSON(participantKey(participant.id), storedRegistration),
      store.setJSON(detailKey(participant.id), { offers, needs, needTag, updatedAt: now }),
      store.set(tokenKey(accessTokenHash), participant.id),
    ]);
    await upsertGeneralNetworkingMember(registration);

    return registration;
  }

  const accessToken = crypto.randomUUID();
  const accessTokenHash = hashToken(accessToken);
  const publicCode = await nextPublicCode(store);
  const profile: EventNetworkProfile = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email,
    emailNormalized,
    generalNetworkOptIn: Boolean(input.generalNetworkOptIn),
    marketingOptIn: Boolean(input.marketingOptIn),
    createdAt: now,
    updatedAt: now,
  };
  const participant: EventParticipant = {
    id: crypto.randomUUID(),
    eventId,
    networkProfileId: profile.id,
    publicCode,
    accessTokenHash,
    status: "registered",
    registeredAt: now,
    updatedAt: now,
  };
  const registration: EventNetworkRegistration = {
    profile,
    participant,
    offers,
    needs,
    needTag,
    accessToken,
  };
  const storedRegistration = { ...registration, accessToken: undefined };

  await Promise.all([
    store.setJSON(profileKey(emailNormalized), storedRegistration),
    store.setJSON(participantKey(participant.id), storedRegistration),
    store.setJSON(detailKey(participant.id), { offers, needs, needTag, updatedAt: now }),
    store.setJSON(codeKey(publicCode), participant.id),
    store.set(tokenKey(accessTokenHash), participant.id),
  ]);
  await upsertGeneralNetworkingMember(registration);

  return registration;
}

export async function getRegistrationByToken(
  store: ReturnType<typeof getEventNetworkStore>,
  accessToken: string,
) {
  const tokenHash = hashToken(clean(accessToken, 100));
  const participantId = await store.get(tokenKey(tokenHash), { consistency: "strong" });
  if (!participantId) return null;
  return (await store.get(participantKey(String(participantId)), {
    type: "json",
    consistency: "strong",
  })) as EventNetworkRegistration | null;
}

export async function listRegistrations(store: ReturnType<typeof getEventNetworkStore>) {
  const rows = await getJsonRows<EventNetworkRegistration>(store, `${datasetPrefix}/participants/`);
  const uniqueRows = new Map<string, EventNetworkRegistration>();
  const usedCodes = new Set<string>();
  rows
    .sort((first, second) =>
      second.participant.updatedAt.localeCompare(first.participant.updatedAt),
    )
    .forEach((row) => {
      const key = row.profile.emailNormalized || row.participant.publicCode;
      if (uniqueRows.has(key) || usedCodes.has(row.participant.publicCode)) return;
      uniqueRows.set(key, row);
      usedCodes.add(row.participant.publicCode);
    });
  return [...uniqueRows.values()].sort((first, second) =>
    second.participant.registeredAt.localeCompare(first.participant.registeredAt),
  );
}

export async function updatePresenceByToken(
  store: ReturnType<typeof getEventNetworkStore>,
  accessToken: string,
  presence: EventNetworkPresence,
) {
  const registration = await getRegistrationByToken(store, accessToken);
  if (!registration) return null;
  const safePresence: EventNetworkPresence = ["open", "meeting", "paused"].includes(presence)
    ? presence
    : "open";
  await store.setJSON(presenceKey(registration.participant.id), {
    presence: safePresence,
    updatedAt: new Date().toISOString(),
  });
  return { registration, presence: safePresence };
}

export async function getNextMatchGroup(
  store: ReturnType<typeof getEventNetworkStore>,
  accessToken: string,
) {
  const current = await getRegistrationByToken(store, accessToken);
  if (!current) return null;

  const rows = await listRegistrations(store);
  const presenceMap = await getPresenceMap(store, rows);
  const currentPresence = presenceMap.get(current.participant.id) || "open";
  const activeMatch = await getActiveMatch(store, current.participant.id);
  if (activeMatch) {
    return {
      status: "ready",
      registration: current,
      presence: "meeting" as const,
      group: await buildActiveMatchGroup(store, activeMatch, current, presenceMap),
    };
  }

  if (currentPresence === "paused") {
    return {
      status: "paused",
      registration: current,
      presence: currentPresence,
      group: null,
    };
  }

  const cursor = await readCursor(store, current.participant.id);
  const nextRound = cursor.round + 1;
  const candidates = rows
    .filter((row) => row.participant.id !== current.participant.id)
    .filter((row) => row.participant.publicCode !== current.participant.publicCode)
    .filter((row) => row.profile.emailNormalized !== current.profile.emailNormalized)
    .filter((row) => row.participant.status === "registered")
    .filter((row) => (presenceMap.get(row.participant.id) || "open") !== "paused")
    .filter((row) => (presenceMap.get(row.participant.id) || "open") !== "meeting")
    .map((row) => ({
      row,
      score: scorePair(current, row),
      seen: cursor.seen.has(row.participant.id),
      tie: stableTieBreaker(current.participant.id, row.participant.id, nextRound),
    }))
    .sort((first, second) => {
      if (first.seen !== second.seen) return first.seen ? 1 : -1;
      if (second.score !== first.score) return second.score - first.score;
      return first.tie - second.tie;
    });

  const activeCandidateIds = await Promise.all(
    candidates.map(async (candidate) => ({
      participantId: candidate.row.participant.id,
      isActive: await hasActiveMatch(store, candidate.row.participant.id),
    })),
  );
  const activeCandidateIdSet = new Set(
    activeCandidateIds
      .filter((candidate) => candidate.isActive)
      .map((candidate) => candidate.participantId),
  );
  const availableCandidates = candidates.filter(
    (candidate) => !activeCandidateIdSet.has(candidate.row.participant.id),
  );

  if (availableCandidates.length < 2) {
    return {
      status: "empty",
      registration: current,
      presence: currentPresence,
      group: null,
    };
  }

  const groupSize = pickGroupSize(
    current.participant.publicCode,
    nextRound,
    availableCandidates.length,
  );
  const selected = availableCandidates.slice(0, groupSize - 1);
  const selectedAvailability = await Promise.all(
    selected.map(async (candidate) => ({
      candidate,
      isActive: await hasActiveMatch(store, candidate.row.participant.id),
    })),
  );
  const stillAvailableSelected = selectedAvailability
    .filter((candidate) => !candidate.isActive)
    .map((candidate) => candidate.candidate);
  if (stillAvailableSelected.length < 2) {
    return {
      status: "empty",
      registration: current,
      presence: currentPresence,
      group: null,
    };
  }
  const finalSelected = stillAvailableSelected.slice(0, groupSize - 1);
  const groupRegistrations = [current, ...finalSelected.map((candidate) => candidate.row)];
  finalSelected.forEach((candidate) => cursor.seen.add(candidate.row.participant.id));
  await writeCursor(store, current.participant.id, nextRound, cursor.seen);

  const score = Math.round(
    finalSelected.reduce((total, candidate) => total + candidate.score, 0) / finalSelected.length,
  );
  const groupId = `match-${current.participant.id}-${nextRound}`;
  const prompts = pickIcebreakers(groupId);
  const participantIds = groupRegistrations.map((registration) => registration.participant.id);
  const photoOwnerParticipantId = pickPhotoOwnerParticipantId(groupId, participantIds);
  const generatedAt = new Date().toISOString();
  const reason = buildReason(current, groupRegistrations);
  await Promise.all(
    participantIds.map((participantId) =>
      store.setJSON(presenceKey(participantId), {
        presence: "meeting",
        updatedAt: generatedAt,
      }),
    ),
  );
  await writeActiveMatch(store, {
    id: groupId,
    round: nextRound,
    score,
    reason,
    participantIds,
    conversationPrompts: prompts,
    photoOwnerParticipantId,
    generatedAt,
    completedParticipantIds: [],
    completedAtByParticipantId: {},
  });

  const group: EventNetworkMatchGroup = {
    id: groupId,
    groupSize,
    round: nextRound,
    score,
    reason,
    members: groupRegistrations.map((registration) =>
      toMatchMember(
        registration,
        "meeting",
        registration.participant.id === current.participant.id,
        false,
        photoOwnerParticipantId === registration.participant.id,
      ),
    ),
    conversationPrompt: prompts[0],
    conversationPrompts: prompts,
    photoOwnerParticipantId,
    generatedAt,
  };

  return {
    status: "ready",
    registration: current,
    presence: "meeting" as const,
    group,
  };
}

export async function completeActiveMatchByToken(
  store: ReturnType<typeof getEventNetworkStore>,
  accessToken: string,
  input: NetworkInput = {},
) {
  const registration = await getRegistrationByToken(store, accessToken);
  if (!registration) return null;
  const activeMatch = await getActiveMatch(store, registration.participant.id);
  if (!activeMatch) {
    return {
      ok: true,
      status: "completed" as const,
      registration,
      completedCount: 0,
      totalCount: 0,
    };
  }

  const now = new Date().toISOString();
  const existingCompletedParticipantIds = new Set(activeMatch.completedParticipantIds || []);
  if (existingCompletedParticipantIds.has(registration.participant.id)) {
    const isAlreadyCompleted = activeMatch.participantIds.every((participantId) =>
      existingCompletedParticipantIds.has(participantId),
    );
    return {
      ok: true,
      status: isAlreadyCompleted ? ("completed" as const) : ("waiting" as const),
      registration,
      completedCount: existingCompletedParticipantIds.size,
      totalCount: activeMatch.participantIds.length,
    };
  }
  const requiresPhoto = activeMatch.photoOwnerParticipantId === registration.participant.id;
  await saveMatchLabReview(registration, input, requiresPhoto);
  const completedParticipantIds = new Set(existingCompletedParticipantIds);
  completedParticipantIds.add(registration.participant.id);
  const updatedMatch: StoredActiveMatch = {
    ...activeMatch,
    completedParticipantIds: [...completedParticipantIds],
    completedAtByParticipantId: {
      ...(activeMatch.completedAtByParticipantId || {}),
      [registration.participant.id]: now,
    },
  };
  const isGroupCompleted = updatedMatch.participantIds.every((participantId) =>
    completedParticipantIds.has(participantId),
  );

  if (isGroupCompleted) {
    await Promise.all([
      ...updatedMatch.participantIds.map((participantId) =>
        store.delete(activeMatchKey(participantId)),
      ),
      ...updatedMatch.participantIds.map((participantId) =>
        store.setJSON(presenceKey(participantId), {
          presence: "open",
          updatedAt: now,
        }),
      ),
      store.setJSON(`${datasetPrefix}/completed-matches/${updatedMatch.id}.json`, {
        ...updatedMatch,
        completedAt: now,
      }),
    ]);
    return {
      ok: true,
      status: "completed" as const,
      registration,
      completedCount: updatedMatch.participantIds.length,
      totalCount: updatedMatch.participantIds.length,
    };
  }

  await Promise.all([
    writeActiveMatch(store, updatedMatch),
    store.setJSON(presenceKey(registration.participant.id), {
      presence: "meeting",
      updatedAt: now,
    }),
  ]);
  return {
    ok: true,
    status: "waiting" as const,
    registration,
    completedCount: completedParticipantIds.size,
    totalCount: updatedMatch.participantIds.length,
  };
}

export async function seedSampleRegistrations(
  store: ReturnType<typeof getEventNetworkStore>,
  samples: Array<{
    firstName: string;
    lastName: string;
    email: string;
    offers: string[];
    needs: string;
    needTag: string;
  }>,
) {
  const registrations: EventNetworkRegistration[] = [];
  for (const sample of samples) {
    registrations.push(
      await registerNetworkProfile(store, {
        ...sample,
        action: "register",
        eventConsent: true,
        generalNetworkOptIn: true,
        marketingOptIn: false,
      }),
    );
  }
  return registrations;
}

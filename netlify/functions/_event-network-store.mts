import { matchFeedbackKey } from "./_match-quality.mjs";
import {
  atomicState,
  readAtomicState,
  deleteAtomicPrefix,
  emptyRooms,
  claimRoom,
  releaseRoom,
  type RoomIndex,
} from "./_atomic-state.mjs";
import { recordMarketingPreference } from "./_announcements.mjs";
import { createHash, randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { getEventProductRuntimeContext } from "./_event-product-context.mjs";
import { getEventReviewStore } from "./_event-review-store.mjs";
import { scorePair, selectMatchCandidates, stableTieBreaker } from "./_matchmaking.mjs";
import { syncMemberEventCode } from "./_member-profile-store.mjs";
import { participantDisplayCode } from "./_participant-code.mjs";
import { matchChatKey } from "./_match-chat.mjs";
import { isLaunchGroupName, matchGroupName } from "./_match-group-name.mjs";
import { generateIntroductionReason, generateMatchAnalysis, rerankMatchCandidates } from "./_ntw-ai.mjs";

type EventNetworkProfile = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailNormalized: string;
  attendedEvent: string;
  generalNetworkOptIn: boolean;
  marketingOptIn: boolean;
  marketingPreferenceVersion?: string;
  marketingPreferenceRecordedAt?: string;
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
  intro: string;
  jobTitle?: string;
  offersDetail: string;
  needs: string;
  needTag: string;
  aiConsent?: {
    version: "2026-09-17";
    analysis: boolean;
    modelImprovement: boolean;
    recordedAt: string;
  };
  accessToken?: string;
};

type NetworkMemberRow = {
  country?: "TR" | "DE";
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
  jobTitle?: string;
  intro?: string;
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
  groupName: string;
  groupSize: number;
  round: number;
  score: number;
  reason: string;
  aiAnalysis?: string;
  analysisSource?: "ai" | "rules";
  members: EventNetworkMatchMember[];
  conversationPrompt: string;
  conversationPrompts?: string[];
  photoOwnerParticipantId?: string;
  rematchApprovedParticipantIds?: string[];
  generatedAt: string;
};

type StoredActiveMatch = {
  id: string;
  groupName?: string;
  round: number;
  score: number;
  reason: string;
  aiAnalysis?: string;
  analysisSource?: "ai" | "rules";
  participantIds: string[];
  conversationPrompts: string[];
  photoOwnerParticipantId?: string;
  rematchApprovedParticipantIds?: string[];
  generatedAt: string;
  completedParticipantIds?: string[];
  completedAtByParticipantId?: Record<string, string>;
};

export type NetworkInput = {
  message?: string;
  messageId?: string;
  action?: string;
  groupId?: string;
  skipReview?: boolean;
  event?: string;
  eventId?: string;
  eventSlug?: string;
  datasetId?: string;
  accessToken?: string;
  presence?: EventNetworkPresence;
  firstName?: string;
  lastName?: string;
  email?: string;
  offers?: string[];
  intro?: string;
  jobTitle?: string;
  offersDetail?: string;
  needs?: string;
  needTag?: string;
  attendedEvent?: string;
  memberUsername?: string;
  rating?: number;
  comment?: string;
  photoDataUrl?: string;
  meetingPlace?: string;
  introductionMessage?: string;
  consent?: boolean;
  eventConsent?: boolean;
  aiAnalysisConsent?: boolean;
  modelImprovementConsent?: boolean;
  generalNetworkOptIn?: boolean;
  marketingOptIn?: boolean;
  marketingPreferenceVersion?: string;
};

export type NetworkAdminInput = {
  participantId?: string;
  photoKey?: string;
  password?: string;
  action?:
    | "list"
    | "recoverParticipant"
    | "matchReport"
    | "matchReportPhoto"
    | "matchOverview"
    | "matchQuality"
    | "resetDemo"
    | "repairCodes"
    | "seedSamples"
    | "startMatching"
    | "processMatching";
  event?: string;
  eventId?: string;
  eventSlug?: string;
  datasetId?: string;
  mode?: "demo" | "live";
};

const legacyEventId = "21-agustos-2026";
const storeName = "event-network";
const legacyDemoDatasetCode = "21agustos-demo";
const legacyLiveDatasetCode = "21agustoscanli";
const legacyDatasetCode =
  process.env.EVENT_NETWORK_DATASET?.trim() ||
  process.env.NETLIFY_EVENT_NETWORK_DATASET?.trim() ||
  legacyLiveDatasetCode;
const legacyDatasetPrefix = `events/${legacyDatasetCode}/network`;
const attendedEventValues = new Set([
  "21-agustos-2026",
  "14-temmuz-2026",
  "22-mayis-2026",
  "10-nisan-2026",
  "8-mart-2026",
  "10-subat-2026",
  "16-ocak-2026",
  "8-aralik-2025",
  "ilk-etkinligim",
]);

export function getEventNetworkStore() {
  return getStore({ name: storeName, consistency: "strong" });
}

function getNetworkContext() {
  return getEventProductRuntimeContext("matchlab");
}

function getNetworkPrefix() {
  return getNetworkContext()?.keyPrefix || legacyDatasetPrefix;
}

function getNetworkEventId() {
  return getNetworkContext()?.eventId || legacyEventId;
}

function getNetworkEventSlug() {
  return getNetworkContext()?.eventSlug || legacyEventId;
}

export function getEventNetworkDatasetInfo() {
  const context = getNetworkContext();
  if (context) {
    return {
      storeName,
      eventId: context.eventId,
      eventSlug: context.eventSlug,
      datasetId: context.datasetId,
      datasetCode: context.datasetId || `${context.eventSlug}-${context.mode}`,
      activeDatabaseCode: context.datasetId || `${context.eventSlug}-${context.mode}`,
      demoDatabaseCode: `${context.eventSlug}-demo`,
      liveDatabaseCode: `${context.eventSlug}-live`,
      keyPrefix: context.keyPrefix,
      mode: context.mode,
    };
  }
  return {
    storeName,
    eventId: legacyEventId,
    eventSlug: legacyEventId,
    datasetCode: legacyDatasetCode,
    activeDatabaseCode: legacyDatasetCode,
    demoDatabaseCode: legacyDemoDatasetCode,
    liveDatabaseCode: legacyLiveDatasetCode,
    keyPrefix: legacyDatasetPrefix,
    mode: legacyDatasetCode === legacyLiveDatasetCode ? "live" : "demo",
  };
}

export async function resetDemoEventNetworkDataset(store: ReturnType<typeof getEventNetworkStore>) {
  if (getEventNetworkDatasetInfo().mode !== "demo") {
    throw new Error("Demo reset sadece demo database üzerinde çalışır");
  }
  const { blobs } = await store.list({ prefix: `${getNetworkPrefix()}/` });
  await Promise.all(blobs.map((blob) => store.delete(blob.key)));
  await deleteAtomicPrefix(`${getNetworkPrefix()}/`);
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

function cleanFreeform(value: unknown) {
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim() : "";
}

export function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function profileKey(emailNormalized: string) {
  return `${getNetworkPrefix()}/profiles/${encodeURIComponent(emailNormalized)}.json`;
}

function participantKey(participantId: string) {
  return `${getNetworkPrefix()}/participants/${participantId}.json`;
}

function codeKey(publicCode: string) {
  return `${getNetworkPrefix()}/codes/${publicCode}.json`;
}

function tokenKey(tokenHash: string) {
  return `${getNetworkPrefix()}/tokens/${tokenHash}.json`;
}

function detailKey(participantId: string) {
  return `${getNetworkPrefix()}/details/${participantId}.json`;
}

function presenceKey(participantId: string) {
  return `${getNetworkPrefix()}/presence/${participantId}.json`;
}

function matchCursorKey(participantId: string) {
  return `${getNetworkPrefix()}/match-cursors/${participantId}.json`;
}

function activeMatchKey(participantId: string) {
  return `${getNetworkPrefix()}/active-matches/${participantId}.json`;
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

async function resolveGeneralUsername(
  emailNormalized: string,
  name: string,
  publicCode: string,
  preferredUsername = "",
) {
  const store = getStore({ name: "networking-members", consistency: "strong" });
  const members = await getJsonRows<NetworkMemberRow>(store, "members/");
  const matchingMember = members.find(
    (member) => normalizeEmail(member.email || "") === emailNormalized,
  );
  if (matchingMember?.username) return matchingMember.username;

  const baseUsername =
    slugify(preferredUsername) || slugify(name) || `notwork-${publicCode.toLocaleLowerCase()}`;
  const existing = (await store.get(generalMemberKey(baseUsername), {
    type: "json",
    consistency: "strong",
  })) as NetworkMemberRow | null;
  if (!existing || normalizeEmail(existing.email || "") === emailNormalized) return baseUsername;
  return `${baseUsername}-${hashToken(emailNormalized).slice(0, 4)}`;
}

async function upsertGeneralNetworkingMember(registration: EventNetworkRegistration) {
  if (getEventNetworkDatasetInfo().mode === "demo") return;
  if (!registration.profile.generalNetworkOptIn) return;

  const store = getStore({ name: "networking-members", consistency: "strong" });
  const username =
    registration.profile.username ||
    (await resolveGeneralUsername(
      registration.profile.emailNormalized,
      displayName(registration),
      registration.participant.publicCode,
    ));
  const existing = (await store.get(generalMemberKey(username), {
    type: "json",
    consistency: "strong",
  })) as NetworkMemberRow | null;
  const eventContext = getNetworkContext();
  const eventLabel = eventContext?.event.shortTitle || "21 Ağustos";
  const eventSlug = getNetworkEventSlug();

  const member: NetworkMemberRow = {
    id: existing?.id || registration.profile.id,
    name: displayName(registration),
    jobTitle: registration.jobTitle || "",
    intro: registration.intro || "",
    country: existing?.country,
    title: registration.needTag
      ? `${eventLabel} katılımcısı · ${registration.needTag}`
      : `${eventLabel} notwork katılımcısı`,
    skills: registration.offers.join(", "),
    email: registration.profile.email,
    instagram: existing?.instagram || "",
    linkedin: existing?.linkedin || "",
    motivation:
      `${registration.intro || ""} ${registration.offersDetail || ""} ${registration.needs}`
        .replace(/\s+/g, " ")
        .trim(),
    contact: `${registration.profile.email} || event:${eventSlug} || claimed-event:${registration.profile.attendedEvent || "belirtilmedi"}`,
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

async function reservePublicCode(
  store: ReturnType<typeof getEventNetworkStore>,
  participantId: string,
) {
  const indexKey = `${getNetworkPrefix()}/code-index-v3.json`;
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const code = participantDisplayCode(participantId, attempt);
    const reserved = await atomicState(
      store,
      indexKey,
      () => ({ owners: {} as Record<string, string> }),
      (state) => {
        const owner = state.owners[code];
        if (owner && owner !== participantId) return false;
        state.owners[code] = participantId;
        return true;
      },
    );
    if (!reserved) continue;
    await store.setJSON(codeKey(code), participantId);
    return code;
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

function pickGroupSize(_publicCode: string, _round: number, availableCount: number) {
  return availableCount >= 2 ? 3 : 0;
}

const icebreakerPools = [
  [
    "Bugün buraya gelirken aklında olan ilk şey neydi?",
    "Bu odada hiç tanımadığın biri seni hangi üç kelimeyle tanısın?",
    "Son zamanlarda seni heyecanlandıran küçük bir şey ne?",
    "Şu an hayatında daha çok yer açmak istediğin şey ne?",
    "Bugünkü enerjini bir şarkıyla anlatsan hangisi olurdu?",
    "İnsanların senin hakkında ilk bakışta fark etmediği bir yönün ne?",
    "Son bir ayda seni en çok güldüren şey neydi?",
    "Bu akşam eve dönerken nasıl hissetmek istersin?",
  ],
  [
    "Şu an üzerinde çalıştığın veya değiştirmek istediğin en gerçek şey ne?",
    "Bu ay çözmeye çalıştığın en net problem ne?",
    "Birine hemen destek olabileceğin konu ne?",
    "Bugün tanışacağın kişilerden ne öğrenmek istiyorsun?",
    "Üzerinde düşündüğün ama henüz başlamadığın fikir ne?",
    "Birlikte üretmek istediğin insanın hangi özelliği olmalı?",
    "Şu sıralar senden en çok zaman isteyen konu ne?",
    "Önündeki bir engeli kaldırabilsen hangisini seçerdin?",
  ],
  [
    "Son dönemde yaptığın en öğretici hata neydi?",
    "Fikrini en son ne zaman ve neden değiştirdin?",
    "Başarısız olma ihtimali olmasa neyi denerdin?",
    "Bir işi bırakmanın doğru karar olduğunu ne zaman anladın?",
    "Sana pahalıya mal olan ama iyi ki öğrendim dediğin ders ne?",
    "Son zamanlarda aldığın en dürüst geri bildirim neydi?",
    "Yeniden başlasan farklı yapacağın bir şey ne?",
    "Kusursuz olmaya çalışmayı bıraktığın konu ne?",
  ],
  [
    "Bu etkinlikten tek bir bağlantıyla ayrılsan, o kişi sana hangi konuda iyi gelsin?",
    "Birlikte küçük bir şey deneyecek olsanız ilk adım ne olurdu?",
    "Seni burada tanıyan biri seni hangi konuda hatırlasın?",
    "Üçünüz yarın ortak bir proje başlatsanız konusu ne olurdu?",
    "Masadaki kişilerden hangi konuda farklı bir bakış duymak istersin?",
    "Birbirinize bu hafta verebileceğiniz en küçük destek ne?",
    "Bu sohbetin bir ay sonra devam etmesi için ne olması gerekir?",
    "Şu an ihtiyacın olan doğru tanışma nasıl biriyle olurdu?",
  ],
];

function pickIcebreakers(groupId: string) {
  const poolOrder = icebreakerPools
    .map((pool, index) => ({ pool, order: stableTieBreaker(groupId, `pool-${index}`, index + 1) }))
    .sort((first, second) => first.order - second.order)
    .slice(0, 3);
  return poolOrder.map(
    ({ pool }, index) =>
      [...pool]
        .map((question) => ({
          question,
          order: stableTieBreaker(groupId, question, index + 1),
        }))
        .sort((first, second) => first.order - second.order)[0].question,
  );
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

  if (!input.consent) throw new Error("Yorum ve fotoğraf yayınlama açık rızası gerekli");
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
  const eventContext = getNetworkContext();
  const reviewEventId = eventContext?.eventSlug || legacyEventId;
  const reviewEventTitle = eventContext
    ? `${eventContext.event.shortTitle} · ${eventContext.event.location.name || "notwork"}`
    : "21 Ağustos notwork · House of Rene Lokal";
  const review = {
    id: crypto.randomUUID(),
    eventId: reviewEventId,
    eventTitle: reviewEventTitle,
    name: displayName(registration) || "notwork katılımcısı",
    rating,
    comment,
    photoDataUrl,
    privateNote: requiresPhoto
      ? `notwork match fotoğraf sorumlusu · kod: ${registration.participant.publicCode}`
      : `notwork match grup yorumu · kod: ${registration.participant.publicCode}`,
    consentAt: now,
    createdAt: now,
  };
  const reviewKey = createHash("sha256")
    .update(`${input.groupId}:${registration.participant.id}`)
    .digest("hex");
  if (eventContext?.datasetId && !eventContext.datasetId.startsWith("legacy-")) {
    await getEventNetworkStore().setJSON(
      `${eventContext.keyPrefix}/reviews/${reviewKey}.json`,
      review,
      { onlyIfNew: true },
    );
    return;
  }
  await getEventReviewStore().setJSON(`reviews/${reviewEventId}/match-${reviewKey}.json`, review, {
    onlyIfNew: true,
  });
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
    jobTitle: registration.jobTitle || "",
    intro: registration.intro || "",
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
    seen: [...seen].slice(-120),
    updatedAt: new Date().toISOString(),
  });
}

async function rememberGroupForEveryParticipant(
  store: ReturnType<typeof getEventNetworkStore>,
  registrations: EventNetworkRegistration[],
) {
  await Promise.all(
    registrations.map(async (registration) => {
      const participantId = registration.participant.id;
      const cursor = await readCursor(store, participantId);
      registrations.forEach((member) => {
        if (member.participant.id !== participantId) cursor.seen.add(member.participant.id);
      });
      await writeCursor(store, participantId, cursor.round + 1, cursor.seen);
    }),
  );
}

async function ensureGroupSeenForEveryParticipant(
  store: ReturnType<typeof getEventNetworkStore>,
  match: StoredActiveMatch,
) {
  await Promise.all(
    match.participantIds.map(async (participantId) => {
      const cursor = await readCursor(store, participantId);
      match.participantIds.forEach((memberId) => {
        if (memberId !== participantId) cursor.seen.add(memberId);
      });
      await writeCursor(store, participantId, Math.max(cursor.round, match.round), cursor.seen);
    }),
  );
}

async function getActiveMatch(
  store: ReturnType<typeof getEventNetworkStore>,
  participantId: string,
) {
  const state = await readAtomicState(
    store,
    `${getNetworkPrefix()}/room-index-v2.json`,
    emptyMatchRooms,
  );
  return state?.groups[state.members[participantId]] || null;
}

async function hasActiveMatch(
  store: ReturnType<typeof getEventNetworkStore>,
  participantId: string,
) {
  return Boolean(await getActiveMatch(store, participantId));
}

type MatchRooms = RoomIndex<StoredActiveMatch> & { pairHistory?: Record<string, true>; rounds?: Record<string, number> };
const emptyMatchRooms = (): MatchRooms => emptyRooms<StoredActiveMatch>();
const launchNamesEnabled = () => getNetworkEventSlug() === "14-kasim-2026";
const pairKey = (a: string, b: string) => a < b ? `${a}:${b}` : `${b}:${a}`;

function groupPairs(ids: string[]) {
  return ids.flatMap((a, index) => ids.slice(index + 1).map((b) => pairKey(a, b)));
}

function displayGroupName(match: StoredActiveMatch) {
  const launch = launchNamesEnabled();
  return match.groupName && (!launch || isLaunchGroupName(match.groupName))
    ? match.groupName
    : matchGroupName(match.id, [], launch);
}

async function writeActiveMatch(
  store: ReturnType<typeof getEventNetworkStore>,
  match: StoredActiveMatch,
) {
  return atomicState(
    store,
    `${getNetworkPrefix()}/room-index-v2.json`,
    emptyMatchRooms,
    (state) => {
      if (match.participantIds.some((id) => state.members[id])) return false;
      const launch = launchNamesEnabled();
      const pairs = launch ? groupPairs(match.participantIds) : [];
      if (pairs.some((key) => state.pairHistory?.[key])) return false;
      match.groupName = matchGroupName(match.id, Object.values(state.groups).map(displayGroupName), launch);
      if (!claimRoom(state, match)) return false;
      if (launch) {
        state.pairHistory ||= {};
        for (const key of pairs) state.pairHistory[key] = true;
        state.rounds ||= {};
        match.round = Math.max(match.round, ...match.participantIds.map((id) => (state.rounds?.[id] ?? 0) + 1));
        for (const id of match.participantIds) state.rounds[id] = match.round;
      }
      return true;
    },
  );
}

async function buildActiveMatchGroup(
  store: ReturnType<typeof getEventNetworkStore>,
  match: StoredActiveMatch,
  current: EventNetworkRegistration,
  presenceMap?: Map<string, EventNetworkPresence>,
) {
  const doneParticipantIds = new Set(match.completedParticipantIds || []);
  const photoOwnerId =
    match.photoOwnerParticipantId || pickPhotoOwnerParticipantId(match.id, match.participantIds);
  const rows = (
    await Promise.all(
      match.participantIds.map((participantId) =>
        store.get(participantKey(participantId), { type: "json", consistency: "strong" }),
      ),
    )
  ).filter(Boolean) as EventNetworkRegistration[];
  const groupPresence = presenceMap ?? (await getPresenceMap(store, rows));
  const feedback = await store.get(matchFeedbackKey(getNetworkPrefix(), match.id, current.participant.id), { type: "json", consistency: "strong" }) as { rating?: number } | null;

  return {
    id: match.id,
    myRating: feedback?.rating,
    groupName: displayGroupName(match),
    groupSize: rows.length,
    round: match.round,
    score: match.score,
    reason: match.reason,
    aiAnalysis: match.aiAnalysis,
    analysisSource: match.analysisSource,
    members: rows.map((registration) =>
      toMatchMember(
        registration,
        groupPresence.get(registration.participant.id) || "meeting",
        registration.participant.id === current.participant.id,
        doneParticipantIds.has(registration.participant.id),
        photoOwnerId === registration.participant.id,
      ),
    ),
    conversationPrompt: match.conversationPrompts[0] || icebreakerPools[0][0],
    conversationPrompts: match.conversationPrompts,
    photoOwnerParticipantId: photoOwnerId,
    rematchApprovedParticipantIds: match.rematchApprovedParticipantIds || [],
    generatedAt: match.generatedAt,
  } satisfies EventNetworkMatchGroup;
}

export async function registerNetworkProfile(
  store: ReturnType<typeof getEventNetworkStore>,
  input: NetworkInput,
  { allowSingleName = false } = {},
) {
  const now = new Date().toISOString();
  const email = clean(input.email, 120);
  const emailNormalized = normalizeEmail(email);
  const firstName = clean(input.firstName, 50);
  const lastName = clean(input.lastName, 50);
  const offers = normalizeOffers(input.offers);
  const intro = cleanFreeform(input.intro);
  const jobTitle = clean(input.jobTitle, 100);
  const offersDetail = cleanFreeform(input.offersDetail);
  const needs = cleanFreeform(input.needs);
  const needTag = clean(input.needTag, 40).toLocaleLowerCase("tr-TR");
  const attendedEvent = clean(input.attendedEvent, 80).toLocaleLowerCase("tr-TR");

  if (!firstName || (!lastName && !allowSingleName)) throw new Error("Ad ve soyad gerekli");
  if (!isValidEmail(emailNormalized)) throw new Error("Geçerli e-posta gerekli");
  if (offers.length === 0) throw new Error("En az bir yardımcı olabileceğin konu gerekli");
  if (
    !attendedEventValues.has(attendedEvent) &&
    attendedEvent !== getNetworkEventSlug() &&
    attendedEvent !== getNetworkEventId()
  )
    throw new Error("Katıldığın Notwork etkinliğini seçmelisin");
  if (!input.eventConsent) throw new Error("Etkinlik eşleştirmesi için onay gerekli");
  const aiConsent = {
    version: "2026-09-17" as const,
    analysis: input.aiAnalysisConsent === true,
    modelImprovement: input.modelImprovementConsent === true,
    recordedAt: now,
  };

  const existing = (await store.get(profileKey(emailNormalized), {
    type: "json",
    consistency: "strong",
  })) as EventNetworkRegistration | null;
  // Old clients and historical checked-by-default values are not new consent evidence.
  const marketingPreference =
    input.marketingPreferenceVersion === "2026-09-09" && typeof input.marketingOptIn === "boolean"
      ? await recordMarketingPreference(emailNormalized, input.marketingOptIn)
      : null;
  if (existing) {
    const accessToken = crypto.randomUUID();
    const accessTokenHash = hashToken(accessToken);
    const username = await resolveGeneralUsername(
      emailNormalized,
      `${firstName} ${lastName}`,
      existing.participant.publicCode,
      clean(input.memberUsername, 80) || existing.profile.username,
    );
    const profile: EventNetworkProfile = {
      ...existing.profile,
      username,
      firstName,
      lastName,
      email,
      emailNormalized,
      attendedEvent,
      generalNetworkOptIn: Boolean(
        input.generalNetworkOptIn || existing.profile.generalNetworkOptIn,
      ),
      marketingOptIn:
        typeof input.marketingOptIn === "boolean"
          ? input.marketingOptIn
          : existing.profile.marketingOptIn,
      ...(marketingPreference
        ? {
            marketingPreferenceVersion: marketingPreference.version,
            marketingPreferenceRecordedAt: marketingPreference.recordedAt,
          }
        : {}),
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
      intro,
      jobTitle,
      offersDetail,
      needs,
      needTag,
      aiConsent,
      accessToken,
    };
    const storedRegistration = { ...registration, accessToken: undefined };

    await Promise.all([
      store.setJSON(profileKey(emailNormalized), storedRegistration),
      store.setJSON(participantKey(participant.id), storedRegistration),
      store.setJSON(detailKey(participant.id), {
        offers,
        intro,
      jobTitle,
        offersDetail,
        needs,
        needTag,
        attendedEvent,
        updatedAt: now,
      }),
      store.set(tokenKey(accessTokenHash), participant.id),
    ]);
    directoryCache.delete(getNetworkPrefix());
    await upsertGeneralNetworkingMember(registration);

    return registration;
  }

  const accessToken = crypto.randomUUID();
  const accessTokenHash = hashToken(accessToken);
  const participantId = crypto.randomUUID();
  const publicCode = await reservePublicCode(store, participantId);
  const username = await resolveGeneralUsername(
    emailNormalized,
    `${firstName} ${lastName}`,
    publicCode,
    clean(input.memberUsername, 80),
  );
  const profile: EventNetworkProfile = {
    id: crypto.randomUUID(),
    username,
    firstName,
    lastName,
    email,
    emailNormalized,
    attendedEvent,
    generalNetworkOptIn: Boolean(input.generalNetworkOptIn),
    marketingOptIn: input.marketingOptIn === true,
    ...(marketingPreference
      ? {
          marketingPreferenceVersion: marketingPreference.version,
          marketingPreferenceRecordedAt: marketingPreference.recordedAt,
        }
      : {}),
    createdAt: now,
    updatedAt: now,
  };
  const participant: EventParticipant = {
    id: participantId,
    eventId: getNetworkEventId(),
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
    intro,
    jobTitle,
    offersDetail,
    needs,
    needTag,
    aiConsent,
    accessToken,
  };
  const storedRegistration = { ...registration, accessToken: undefined };

  await Promise.all([
    store.setJSON(profileKey(emailNormalized), storedRegistration),
    store.setJSON(participantKey(participant.id), storedRegistration),
    store.setJSON(detailKey(participant.id), {
      offers,
      intro,
      jobTitle,
      offersDetail,
      needs,
      needTag,
      attendedEvent,
      updatedAt: now,
    }),
    store.set(tokenKey(accessTokenHash), participant.id),
  ]);
  directoryCache.delete(getNetworkPrefix());
  await upsertGeneralNetworkingMember(registration);

  return registration;
}

// Only the authenticated participant may edit their event profile. Match identity stays fixed.
export async function editLaunchProfile(store: ReturnType<typeof getEventNetworkStore>, input: NetworkInput) {
  const row = await getRegistrationByToken(store, clean(input.accessToken, 100));
  if (!row || row.participant.status !== "registered") throw Error("Etkinlik oturumu gerekli");
  const contactKey = `${getNetworkPrefix()}/guest-contacts/${row.participant.id}.json`;
  const contact = await store.get(contactKey, { type: "json", consistency: "strong" }) as { email?: string } | null;
  if (input.action === "launchProfile") return { registration: row, email: contact?.email || "" };
  const name = clean(input.firstName, 100);
  const jobTitle = clean(input.jobTitle, 100);
  const email = normalizeEmail(clean(input.email, 120));
  if (!name || !jobTitle) throw Error("Ad soyad ve ünvan gerekli.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error("Geçerli bir e-posta yaz.");
  if (email) {
    const key = `${getNetworkPrefix()}/guest-email-index/${hashToken(email)}.json`;
    await store.setJSON(key, { id: row.participant.id }, { onlyIfNew: true });
    const owner = await store.get(key, { type: "json", consistency: "strong" }) as { id: string };
    if (owner.id !== row.participant.id) throw Error("Bu e-posta başka bir etkinlik kaydında kullanılıyor.");
  }
  const [firstName, ...rest] = name.split(/\s+/);
  const now = new Date().toISOString();
  const updated = {
    ...row, accessToken: undefined,
    profile: { ...row.profile, firstName, lastName: rest.join(" "), updatedAt: now },
    participant: { ...row.participant, updatedAt: now },
    jobTitle, intro: clean(input.intro, 4000), offersDetail: clean(input.offersDetail, 4000), needs: clean(input.needs, 4000),
    offers: (input.offers || row.offers).slice(0, 10).map(value => clean(value, 100)).filter(Boolean),
    aiConsent: { version: "2026-09-17" as const, analysis: input.aiAnalysisConsent === true, modelImprovement: row.aiConsent?.modelImprovement === true, recordedAt: now },
  };
  await Promise.all([
    store.setJSON(participantKey(row.participant.id), updated),
    store.setJSON(profileKey(row.profile.emailNormalized), updated),
    store.setJSON(detailKey(row.participant.id), { intro: updated.intro, jobTitle, offers: updated.offers, offersDetail: updated.offersDetail, needs: updated.needs, needTag: row.needTag, updatedAt: now }),
    store.setJSON(contactKey, { email }),
  ]);
  if (contact?.email && normalizeEmail(contact.email) !== email) {
    const oldKey = `${getNetworkPrefix()}/guest-email-index/${hashToken(normalizeEmail(contact.email))}.json`;
    const owner = await store.get(oldKey, { type: "json", consistency: "strong" }) as { id: string } | null;
    if (owner?.id === row.participant.id) await store.delete(oldKey);
  }
  directoryCache.delete(getNetworkPrefix());
  await upsertGeneralNetworkingMember(updated);
  return { registration: { ...updated, accessToken: clean(input.accessToken, 100) }, email };
}

export async function eventChat(
  store: ReturnType<typeof getEventNetworkStore>,
  accessToken: string,
  input: NetworkInput,
) {
  const registration = await getRegistrationByToken(store, accessToken);
  if (!registration || registration.participant.status !== "registered")
    throw new Error("Etkinlik oturumu gerekli");
  const activeGroup = await getActiveMatch(store, registration.participant.id);
  const key = matchChatKey(
    getNetworkPrefix(),
    registration.participant.id,
    activeGroup,
    input.groupId,
  );
  type Message = {
    id: string;
    participantId: string;
    name: string;
    code: string;
    text: string;
    createdAt: string;
  };
  if (input.action === "chatRead") {
    const messages =
      (await readAtomicState(store, key, () => ({ messages: [] as Message[] })))?.messages || [];
    matchChatKey(
      getNetworkPrefix(),
      registration.participant.id,
      await getActiveMatch(store, registration.participant.id),
      activeGroup?.id,
    );
    return messages;
  }
  const message = clean(input.message, 500);
  const id = clean(input.messageId, 80);
  if (!message || !/^[a-zA-Z0-9-]{8,80}$/.test(id)) throw new Error("Mesaj geçersiz");
  return atomicState(
    store,
    key,
    () => ({ messages: [] as Message[] }),
    (state) => {
      if (
        state.messages.some(
          (row) => row.id === id && row.participantId === registration.participant.id,
        )
      )
        return state.messages;
      const last = [...state.messages]
        .reverse()
        .find((row) => row.participantId === registration.participant.id);
      if (last && Date.now() - Date.parse(last.createdAt) < 1500)
        throw new Error("Biraz bekleyip tekrar gönder.");
      state.messages.push({
        id,
        participantId: registration.participant.id,
        name: displayName(registration),
    jobTitle: registration.jobTitle || "",
    intro: registration.intro || "",
        code: registration.participant.publicCode,
        text: message,
        createdAt: new Date().toISOString(),
      });
      state.messages = state.messages.slice(-200);
      return state.messages;
    },
  );
}

export async function resumeNetworkProfile(
  store: ReturnType<typeof getEventNetworkStore>,
  email: string,
  preferredUsername = "",
) {
  const emailNormalized = normalizeEmail(clean(email, 120));
  if (!isValidEmail(emailNormalized)) return null;
  const existing = (await store.get(profileKey(emailNormalized), {
    type: "json",
    consistency: "strong",
  })) as EventNetworkRegistration | null;
  if (!existing) return null;

  const now = new Date().toISOString();
  const accessToken = crypto.randomUUID();
  const accessTokenHash = hashToken(accessToken);
  const username = await resolveGeneralUsername(
    emailNormalized,
    displayName(existing),
    existing.participant.publicCode,
    preferredUsername || existing.profile.username,
  );
  const registration: EventNetworkRegistration = {
    ...existing,
    profile: { ...existing.profile, username, updatedAt: now },
    participant: { ...existing.participant, accessTokenHash, updatedAt: now },
    intro: existing.intro || "",
    jobTitle: existing.jobTitle || "",
    offersDetail: existing.offersDetail || "",
    accessToken,
  };
  const storedRegistration = { ...registration, accessToken: undefined };
  await Promise.all([
    store.setJSON(profileKey(emailNormalized), storedRegistration),
    store.setJSON(participantKey(registration.participant.id), storedRegistration),
    store.set(tokenKey(accessTokenHash), registration.participant.id),
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
  const existing = (await store.get(participantKey(String(participantId)), {
    type: "json",
    consistency: "strong",
  })) as EventNetworkRegistration | null;
  if (!existing) return null;

  if (existing.profile.username && existing.profile.attendedEvent) return existing;
  const username = await resolveGeneralUsername(
    existing.profile.emailNormalized,
    displayName(existing),
    existing.participant.publicCode,
    existing.profile.username,
  );
  const hydrated: EventNetworkRegistration = {
    ...existing,
    profile: {
      ...existing.profile,
      username,
      attendedEvent: existing.profile.attendedEvent || getNetworkEventSlug(),
    },
    intro: existing.intro || "",
    jobTitle: existing.jobTitle || "",
    offersDetail: existing.offersDetail || "",
  };
  await Promise.all([
    store.setJSON(profileKey(hydrated.profile.emailNormalized), hydrated),
    store.setJSON(participantKey(hydrated.participant.id), hydrated),
  ]);
  await upsertGeneralNetworkingMember(hydrated);
  return hydrated;
}

export async function listRegistrations(store: ReturnType<typeof getEventNetworkStore>) {
  const rows = await getJsonRows<EventNetworkRegistration>(
    store,
    `${getNetworkPrefix()}/participants/`,
  );
  const uniqueRows = new Map<string, EventNetworkRegistration>();
  rows
    .sort((first, second) =>
      second.participant.updatedAt.localeCompare(first.participant.updatedAt),
    )
    .forEach((row) => {
      const key = row.profile.emailNormalized || row.participant.id;
      if (uniqueRows.has(key)) return;
      uniqueRows.set(key, row);
    });
  return [...uniqueRows.values()].sort((first, second) =>
    second.participant.registeredAt.localeCompare(first.participant.registeredAt),
  );
}

export async function listActiveMatchGroups(
  store: ReturnType<typeof getEventNetworkStore>,
  registrations: EventNetworkRegistration[],
) {
  const state = await readAtomicState(
    store,
    `${getNetworkPrefix()}/room-index-v2.json`,
    emptyMatchRooms,
  );
  const names = new Map(
    registrations.map((registration) => [
      registration.participant.id,
      `${registration.profile.firstName} ${registration.profile.lastName}`.trim(),
    ]),
  );
  return Object.values(state?.groups || {}).map((group) => ({
    id: group.id,
    groupName: displayGroupName(group),
    round: group.round,
    score: group.score,
    reason: group.reason,
    memberNames: group.participantIds.map((id) => names.get(id) || "Katılımcı"),
    approvedMemberNames: (group.rematchApprovedParticipantIds || []).map((id) => names.get(id) || "Katılımcı"),
  }));
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

export type MatchLaunchState = {
  status: "waiting" | "running" | "open";
  participantIds: string[];
  cursor: number;
  runId: string;
};

function initialMatchLaunch(): MatchLaunchState {
  const dataset = getEventNetworkDatasetInfo();
  return {
    status:
      (dataset.eventId === "evt_9_ekim_2026" && dataset.mode === "live") ||
      dataset.eventSlug === "14-kasim-2026"
        ? "waiting"
        : "open",
    participantIds: [],
    cursor: 0,
    runId: "",
  };
}

export async function getMatchLaunchState(store: ReturnType<typeof getEventNetworkStore>) {
  return readAtomicState(store, `${getNetworkPrefix()}/match-launch.json`, initialMatchLaunch);
}

export function automaticMatchThreshold() {
  const dataset = getEventNetworkDatasetInfo();
  return dataset.eventSlug === "14-kasim-2026" && dataset.mode === "live" ? 20 : 0;
}

// One short worker at a time. The threshold opens the pool once; it never resets rooms.
export async function advanceAutomaticMatchLaunch(store: ReturnType<typeof getEventNetworkStore>) {
  let state = await getMatchLaunchState(store);
  if (!automaticMatchThreshold() || state.status === "open") return state;
  if (state.status === "waiting") {
    const count = (await listRegistrations(store)).filter(r => r.participant.status === "registered").length;
    if (count < automaticMatchThreshold()) return state;
  }
  const owner = randomUUID();
  const key = `${getNetworkPrefix()}/auto-match-worker.json`;
  const claimed = await atomicState(store, key, () => ({ owner: "", until: 0 }), lock => {
    if (lock.until > Date.now()) return false;
    lock.owner = owner; lock.until = Date.now() + 45_000; return true;
  });
  if (!claimed) return getMatchLaunchState(store);
  try {
    state = await getMatchLaunchState(store);
    if (state.status === "waiting") await startMatchLaunch(store);
    return await processMatchLaunch(store);
  } finally {
    await atomicState(store, key, () => ({ owner: "", until: 0 }), lock => {
      if (lock.owner === owner) { lock.owner = ""; lock.until = 0; }
    });
  }
}

export async function startMatchLaunch(store: ReturnType<typeof getEventNetworkStore>) {
  const rows = (await listRegistrations(store)).filter(
    (row) => row.participant.status === "registered",
  );
  return atomicState(
    store,
    `${getNetworkPrefix()}/match-launch.json`,
    initialMatchLaunch,
    (state) => {
      if (state.status === "waiting") {
        state.status = "running";
        state.participantIds = rows.map((row) => row.participant.id);
        state.cursor = 0;
        state.runId = crypto.randomUUID();
      }
      return { ...state };
    },
  );
}

// Bounded, resumable chunks: no single Function has to form every group at once.
// Room claims remain atomic, so retries and two admin tabs cannot duplicate membership.
export async function processMatchLaunch(store: ReturnType<typeof getEventNetworkStore>) {
  const job = await getMatchLaunchState(store);
  if (job.status !== "running") return job;
  const rows = await listRegistrations(store);
  const participants = new Map(rows.map((row) => [row.participant.id, row]));
  const presenceMap = await getPresenceMap(store, rows);
  const eligibleIds = new Set(job.participantIds);
  const end = Math.min(job.cursor + 6, job.participantIds.length);
  const batch = {
    rows,
    presenceMap,
    eligibleIds,
    aiRemaining: getEventNetworkDatasetInfo().eventSlug === "14-kasim-2026" ? 1 : 0,
  };
  for (let index = job.cursor; index < end; index++) {
    const current = participants.get(job.participantIds[index]);
    if (current?.participant.status === "registered") {
      await matchRegistration(store, current, batch);
    }
  }
  return atomicState(
    store,
    `${getNetworkPrefix()}/match-launch.json`,
    initialMatchLaunch,
    (state) => {
      if (state.runId === job.runId && state.status === "running") {
        state.cursor = Math.max(state.cursor, end);
        if (state.cursor >= state.participantIds.length) state.status = "open";
      }
      return { ...state };
    },
  );
}

export async function getNextMatchGroup(
  store: ReturnType<typeof getEventNetworkStore>,
  accessToken: string,
) {
  const current = await getRegistrationByToken(store, accessToken);
  if (!current) return null;
  await advanceAutomaticMatchLaunch(store);
  const activeMatch = await getActiveMatch(store, current.participant.id);
  if (activeMatch) {
    return {
      status: "ready",
      registration: current,
      presence: "meeting" as const,
      group: await buildActiveMatchGroup(store, activeMatch, current),
    };
  }
  const launch = await getMatchLaunchState(store);
  if (launch.status !== "open") {
    return {
      status: "empty",
      waitingReason: launch.status === "waiting" ? (automaticMatchThreshold() ? "threshold" : "admin") : "matching",
      startThreshold: automaticMatchThreshold(),
      registration: current,
      presence: "open" as const,
      group: null,
    };
  }
  return matchRegistration(store, current);
}

async function matchRegistration(
  store: ReturnType<typeof getEventNetworkStore>,
  current: EventNetworkRegistration,
  batch?: {
    rows: EventNetworkRegistration[];
    presenceMap: Map<string, EventNetworkPresence>;
    eligibleIds: Set<string>;
    aiRemaining: number;
  },
) {
  // Most polling requests already belong to a group. Read only that group,
  // rather than scanning every participant and presence record on each poll.
  const activeMatch = await getActiveMatch(store, current.participant.id);
  if (activeMatch) {
    return {
      status: "ready",
      registration: current,
      presence: "meeting" as const,
      group: await buildActiveMatchGroup(store, activeMatch, current),
    };
  }

  const rows = batch?.rows || (await listRegistrations(store));
  const presenceMap = batch?.presenceMap || (await getPresenceMap(store, rows));
  const currentPresence = presenceMap.get(current.participant.id) || "open";
  if (currentPresence === "paused" || current.participant.status !== "registered") {
    return {
      status: "paused",
      registration: current,
      presence: currentPresence,
      group: null,
    };
  }

  const cursor = await readCursor(store, current.participant.id);
  const nextRound = cursor.round + 1;
  const candidateRows = rows
    .filter((row) => !batch || batch.eligibleIds.has(row.participant.id))
    .filter((row) => row.participant.id !== current.participant.id)
    .filter((row) => row.profile.emailNormalized !== current.profile.emailNormalized)
    .filter((row) => row.participant.status === "registered")
    .filter((row) => !cursor.seen.has(row.participant.id))
    .filter((row) => (presenceMap.get(row.participant.id) || "open") !== "paused");
  let waitingCount = 1;
  let triedAi = false;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const roomIndex = await readAtomicState(
      store,
      `${getNetworkPrefix()}/room-index-v2.json`,
      emptyMatchRooms,
    );
    const currentGroupId = roomIndex?.members[current.participant.id];
    const currentActiveMatch = currentGroupId ? roomIndex?.groups[currentGroupId] : null;
    if (currentActiveMatch) {
      return {
        status: "ready",
        registration: current,
        presence: "meeting" as const,
        group: await buildActiveMatchGroup(store, currentActiveMatch, current, presenceMap),
      };
    }

    const activeParticipantIds = new Set(Object.keys(roomIndex?.members || {}));
    const strict = launchNamesEnabled();
    const compatible = (a: EventNetworkRegistration, b: EventNetworkRegistration) =>
      !strict || !roomIndex.pairHistory?.[pairKey(a.participant.id, b.participant.id)];
    const availableCandidates = candidateRows.filter(
      (candidate) => !activeParticipantIds.has(candidate.participant.id) && compatible(current, candidate),
    );
    waitingCount = availableCandidates.length + 1;
    if (availableCandidates.length < 2) break;

    const groupSize = pickGroupSize(
      current.participant.publicCode,
      nextRound,
      availableCandidates.length,
    );
    const deterministicSelected = selectMatchCandidates(
      current,
      availableCandidates,
      cursor.seen,
      nextRound,
      compatible,
    );
    let selected = deterministicSelected;
    const aiAllowed = batch ? batch.aiRemaining > 0 : rows.length <= 6;
    if (!triedAi && aiAllowed && current.aiConsent?.analysis) {
      const aiShortlist = availableCandidates
        .filter((candidate) => candidate.aiConsent?.analysis)
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
        })
        .slice(0, 8);
      if (aiShortlist.length >= 2) {
        triedAi = true;
        if (batch) batch.aiRemaining--;
        const aiIds = await rerankMatchCandidates(
          getNetworkPrefix(),
          current,
          aiShortlist.map((candidate) => candidate.row),
          groupSize - 1,
        );
        if (aiIds) {
          const aiSelected = aiIds
            .map((id) => aiShortlist.find((candidate) => candidate.row.participant.id === id))
            .filter(Boolean) as typeof aiShortlist;
          if (aiSelected.length === groupSize - 1 && compatible(aiSelected[0].row, aiSelected[1].row)) selected = aiSelected;
        }
      }
    }
    if (selected.length < 2) break;

    const finalSelected = selected.slice(0, groupSize - 1);
    const groupRegistrations = [current, ...finalSelected.map((candidate) => candidate.row)];
    const score = Math.round(
      finalSelected.reduce((total, candidate) => total + candidate.score, 0) / finalSelected.length,
    );
    const groupId = `match-${crypto.randomUUID()}`;
    const prompts = pickIcebreakers(groupId);
    const participantIds = groupRegistrations.map((registration) => registration.participant.id);
    const photoOwnerParticipantId = pickPhotoOwnerParticipantId(groupId, participantIds);
    const generatedAt = new Date().toISOString();
    const reason = buildReason(current, groupRegistrations);
    const storedMatch: StoredActiveMatch = {
      id: groupId,
      round: nextRound,
      score,
      reason,
      aiAnalysis: reason,
      analysisSource: "rules",
      participantIds,
      conversationPrompts: prompts,
      photoOwnerParticipantId,
      generatedAt,
      completedParticipantIds: [],
      completedAtByParticipantId: {},
    };
    const claimed = await writeActiveMatch(store, storedMatch);
    if (!claimed) continue;

    let aiAnalysis: string | undefined;
    // At event scale, the rules result is already stored and returned without waiting on AI.
    // Limit optional analysis to the quiet first arrivals; never fan out 30+ model calls.
    if (
      !batch &&
      rows.length <= 6 &&
      groupRegistrations.every((registration) => registration.aiConsent?.analysis)
    ) {
      aiAnalysis =
        (await generateMatchAnalysis(getNetworkPrefix(), groupRegistrations)) || undefined;
      if (aiAnalysis) {
        storedMatch.aiAnalysis = aiAnalysis;
        storedMatch.analysisSource = "ai";
        try {
          await atomicState(
            store,
            `${getNetworkPrefix()}/room-index-v2.json`,
            emptyMatchRooms,
            (state) => {
              if (state.groups[groupId]) {
                state.groups[groupId].aiAnalysis = aiAnalysis;
                state.groups[groupId].analysisSource = "ai";
              }
            },
          );
        } catch (error) {
          console.error("Match AI analizi kaydedilemedi", error);
        }
      }
    }

    try {
      await store.setJSON(`${getNetworkPrefix()}/match-profile-snapshots/${groupId}.json`, {
        schemaVersion: 1, scope: getNetworkPrefix(), groupId, recordedAt: generatedAt,
        members: groupRegistrations.map(r => ({ participantId: r.participant.id, name: `${r.participant.firstName} ${r.participant.lastName}`.trim(), jobTitle: r.jobTitle || "", intro: r.intro, offers: r.offers, offersDetail: r.offersDetail, needs: r.needs })),
      }, { onlyIfNew: true });
      await store.setJSON(`${getNetworkPrefix()}/match-history/${groupId}.json`, storedMatch, {
        onlyIfNew: true,
      });
    } catch (error) {
      console.error("Match eşleşme arşivi kaydedilemedi", error);
    }

    try {
      if (!launchNamesEnabled()) await rememberGroupForEveryParticipant(store, groupRegistrations);

    } catch (error) {
      console.error("Match geçmişi yazılamadı", error);
    }
    const group: EventNetworkMatchGroup = {
      id: groupId,
      groupName: displayGroupName(storedMatch),
      groupSize,
      round: storedMatch.round,
      score,
      reason,
      aiAnalysis: storedMatch.aiAnalysis,
      analysisSource: storedMatch.analysisSource,
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

  const existing = await getActiveMatch(store, current.participant.id);
  return {
    status: existing ? "ready" : "empty",
    waitingCount: existing ? undefined : waitingCount,
    registration: current,
    presence: existing ? ("meeting" as const) : currentPresence,
    group: existing ? await buildActiveMatchGroup(store, existing, current, presenceMap) : null,
  };
}

export async function rateActiveMatch(
  store: ReturnType<typeof getEventNetworkStore>,
  token: string,
  input: NetworkInput,
) {
  const registration = await getRegistrationByToken(store, token);
  if (!registration || registration.participant.status !== "registered") return false;
  const active = await getActiveMatch(store, registration.participant.id);
  if (!active || active.id !== input.groupId) return false;
  if (!Number.isInteger(input.rating) || input.rating! < 1 || input.rating! > 5)
    throw new Error("Puan 1–5 arasında olmalı");
  await store.setJSON(matchFeedbackKey(getNetworkPrefix(), active.id, registration.participant.id), {
    schemaVersion: 1,
    scope: getNetworkPrefix(),
    groupId: active.id,
    participantId: registration.participant.id,
    participantIds: active.participantIds,
    round: active.round,
    rating: input.rating,
    modelImprovement: input.modelImprovementConsent === true,
    recordedAt: new Date().toISOString(),
  });
  return true;
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

  if (!input.groupId || input.groupId !== activeMatch.id)
    throw new Error("Grubun değişti. Ekranı yenile.");
  await saveMatchLabReview(
    registration,
    input,
    (activeMatch.photoOwnerParticipantId ||
      pickPhotoOwnerParticipantId(activeMatch.id, activeMatch.participantIds)) ===
      registration.participant.id,
  );
  const rotation = await rotateActiveMatchByToken(store, accessToken, input.groupId);
  if (rotation.released) {
    try {
      await store.setJSON(`${getNetworkPrefix()}/match-history/${activeMatch.id}.json`, {
        ...activeMatch,
        completedAt: new Date().toISOString(),
        completedByParticipantId: registration.participant.id,
      });
    } catch (error) {
      console.error("Tamamlanan Match eşleşmesi arşivlenemedi", error);
    }
  }
  return {
    ok: true,
    status: "completed" as const,
    registration,
    completedCount: 1,
    totalCount: activeMatch.participantIds.length,
  };
}

export async function rotateActiveMatchByToken(
  store: ReturnType<typeof getEventNetworkStore>,
  accessToken: string,
  groupId: string,
) {
  const registration = await getRegistrationByToken(store, accessToken);
  if (!registration || registration.participant.status !== "registered")
    throw new Error("Etkinlik oturumu gerekli");
  if (!groupId) throw new Error("Grup kimliği gerekli");
  const activeMatch = await getActiveMatch(store, registration.participant.id);
  if (!activeMatch) return { ok: true as const, released: false };
  const strict = launchNamesEnabled();
  if (activeMatch.id !== groupId) {
    if (strict) return { ok: true as const, released: false };
    throw new Error("Grubun değişti. Yeni eşleşmeni aç.");
  }
  if (!strict) await ensureGroupSeenForEveryParticipant(store, activeMatch);
  return atomicState(
    store,
    `${getNetworkPrefix()}/room-index-v2.json`,
    emptyMatchRooms,
    (state) => {
      const group = state.groups[groupId];
      if (
        !group ||
        state.members[registration.participant.id] !== groupId ||
        !group.participantIds.includes(registration.participant.id)
      )
        return { ok: true as const, released: false };
      group.rematchApprovedParticipantIds = [
        ...new Set([...(group.rematchApprovedParticipantIds || []), registration.participant.id]),
      ];
      const approved = group.rematchApprovedParticipantIds.filter((id) =>
        group.participantIds.includes(id),
      );
      // Launchspace participants can leave immediately; absent members cannot block them.
      const all = strict || group.participantIds.every((id) => approved.includes(id));
      if (all) {
        if (strict) {
          state.pairHistory ||= {};
          for (const key of groupPairs(group.participantIds)) state.pairHistory[key] = true;
        }
        releaseRoom(state, registration.participant.id, groupId);
      }
      return {
        ok: true as const,
        released: all,
        approvedCount: approved.length,
        totalCount: group.participantIds.length,
      };
    },
  );
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
        intro: `${sample.firstName} ${sample.lastName}, ${sample.offers.join(", ")} alanlarında çalışan ve farklı ekiplerle üretim yapan bir Notwork katılımcısıdır. Deneyimlerini açıkça paylaşmayı ve yeni insanlarla uzun vadeli bağ kurmayı önemsiyor.`,
        offersDetail: `${sample.offers.join(", ")} konularında uygulamalı deneyim, fikir geliştirme ve ekiplerle birlikte sonuç üretme desteği sunabilir. Bildiklerini açık biçimde paylaşır ve karşısındaki kişinin ihtiyacını dinleyerek somut katkı sağlamaya çalışır.`,
        needs: `${sample.needs}. Bu ihtiyacın neden önemli olduğunu, hangi aşamada olduğunu ve doğru kişiyle tanıştığında birlikte nasıl bir sonuç üretmek istediğini ayrıntılı biçimde anlatmak istiyor.`,
        attendedEvent: getNetworkEventSlug(),
        action: "register",
        eventConsent: true,
        aiAnalysisConsent: false,
        modelImprovementConsent: false,
        generalNetworkOptIn: false,
        marketingOptIn: false,
      }),
    );
  }
  return registrations;
}

// Explicit admin repair: retain identities, tokens and room membership.
export async function repairParticipantCodes(store: ReturnType<typeof getEventNetworkStore>) {
  const rows = await listRegistrations(store);
  const seen = new Set<string>();
  const invalidCodes = rows.filter((row) => {
    const code = row.participant.publicCode;
    if (seen.has(code) || !/^[A-HJ-NP-Z][0-9]{3}$/.test(code)) return true;
    seen.add(code);
    return false;
  });
  let repaired = 0;
  for (const row of invalidCodes.slice(0, 5)) {
    const key = participantKey(row.participant.id);
    const current = (await store.get(key, {
      type: "json",
      consistency: "strong",
    })) as EventNetworkRegistration;
    if (!current || current.participant.publicCode !== row.participant.publicCode) continue;
    const code = await reservePublicCode(store, current.participant.id);
    await store.setJSON(
      `${getNetworkPrefix()}/code-repair-backups/${current.participant.id}.json`,
      current,
      { onlyIfNew: true },
    );
    for (const recordKey of [key, profileKey(current.profile.emailNormalized)]) {
      const fresh = (await store.get(recordKey, {
        type: "json",
        consistency: "strong",
      })) as EventNetworkRegistration | null;
      if (fresh?.participant.id === current.participant.id)
        await store.setJSON(recordKey, {
          ...fresh,
          participant: { ...fresh.participant, publicCode: code },
        });
    }
    if (
      !(getNetworkEventSlug() === "14-kasim-2026" && getEventNetworkDatasetInfo().mode === "demo")
    )
      await syncMemberEventCode(
        current.profile.username,
        current.profile.emailNormalized,
        current.participant.eventId,
        code,
      );
    repaired++;
  }
  return { repaired, remaining: Math.max(0, invalidCodes.length - repaired) };
}

// The event directory exposes only event-profile fields, never session or contact data.
// Coalesce directory requests within each warm function instance and dataset.
const directoryCache = new Map<
  string,
  { expiresAt: number; rows: Promise<EventNetworkRegistration[]> }
>();

function directoryRegistrations(store: ReturnType<typeof getEventNetworkStore>) {
  const key = getNetworkPrefix();
  const now = Date.now();
  const cached = directoryCache.get(key);
  if (cached && cached.expiresAt > now) return cached.rows;
  if (directoryCache.size >= 32) directoryCache.clear();
  const rows = listRegistrations(store).catch((error) => {
    if (directoryCache.get(key)?.rows === rows) directoryCache.delete(key);
    throw error;
  });
  directoryCache.set(key, { expiresAt: now + 5000, rows });
  return rows;
}

export async function launchSpacePeople(
  store: ReturnType<typeof getEventNetworkStore>,
  accessToken: string,
  targetId?: string,
  proposal?: NetworkInput,
) {
  const self = await getRegistrationByToken(store, accessToken);
  if (!self || self.participant.status !== "registered")
    throw new Error("Etkinlik oturumu gerekli");
  const rows = (await (targetId ? listRegistrations(store) : directoryRegistrations(store))).filter(
    (r) => r.participant.status === "registered",
  );
  const key = `${getNetworkPrefix()}/introductions-v1.json`;
  type Introductions = { requests: Record<string, { from: string; to: string; at: string; updatedAt?: string; place?: string; message?: string }> };
  const empty = (): Introductions => ({ requests: {} });
  let state: Introductions;
  if (targetId) {
    if (targetId === self.participant.id || !rows.some((r) => r.participant.id === targetId))
      throw new Error("Bu etkinlikte geçerli bir kişi seç");
    state = await atomicState(store, key, empty, (s) => {
      const id = `${self.participant.id}:${targetId}`;
      const now = new Date().toISOString();
      const prior = s.requests[id];
      const place = clean(proposal?.meetingPlace, 120);
      const message = clean(proposal?.introductionMessage, 300);
      if (!prior || (proposal && (prior.place !== place || prior.message !== message))) {
        s.requests[id] = {
          from: self.participant.id, to: targetId, at: prior?.at || now,
          updatedAt: now, place, message,
        };
      }
      return s;
    });
  } else state = await readAtomicState(store, key, empty);
  return {
    people: rows.map((r) => ({
      id: r.participant.id,
      name: `${r.profile.firstName} ${r.profile.lastName}`.trim(),
      code: r.participant.publicCode,
      intro: r.intro,
      jobTitle: r.jobTitle || "",
      offers: r.offers,
      offersDetail: r.offersDetail,
      needs: r.needs,
      isSelf: r.participant.id === self.participant.id,
      outgoing: state.requests[`${self.participant.id}:${r.participant.id}`],
      incoming: state.requests[`${r.participant.id}:${self.participant.id}`],
      sent: Boolean(state.requests[`${self.participant.id}:${r.participant.id}`]),
      received: Boolean(state.requests[`${r.participant.id}:${self.participant.id}`]),
    })),
  };
}

/** Event-owned selfie. Uploading it does not approve a rematch. */
export async function saveLaunchGroupSelfie(
  store: ReturnType<typeof getEventNetworkStore>,
  input: NetworkInput,
) {
  const registration = await getRegistrationByToken(store, clean(input.accessToken, 100));
  const match = registration && await getActiveMatch(store, registration.participant.id);
  if (!match || match.id !== input.groupId) throw new Error("Aktif grup bulunamadı");
  const photo = input.photoDataUrl;
  if (typeof photo !== "string" || photo.length > 1_100_000 ||
      !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo))
    throw new Error("Geçerli bir grup fotoğrafı seç");
  const record = {
    schemaVersion: 1, scope: getNetworkPrefix(), groupId: match.id,
    participantIds: match.participantIds, round: match.round,
    photo, participantId: registration.participant.id, savedAt: new Date().toISOString(),
  };
  await store.setJSON(`${getNetworkPrefix()}/selfie-archive/${match.id}/${randomUUID()}.json`, record);
  await store.setJSON(`${getNetworkPrefix()}/group-selfies/${match.id}.json`, {
    schemaVersion: 1, scope: getNetworkPrefix(), groupId: match.id,
    participantIds: match.participantIds, round: match.round,
    photo, participantId: registration.participant.id, savedAt: new Date().toISOString(),
  });
}

export async function launchIntroductionReason(
  store: ReturnType<typeof getEventNetworkStore>,
  accessToken: string,
  targetId: string,
) {
  if (!process.env.OPENAI_API_KEY || process.env.NTW_AI_ENABLED === "false") return "";
  const viewer = await getRegistrationByToken(store, accessToken);
  if (!viewer?.aiConsent?.analysis || viewer.participant.status !== "registered" ||
      viewer.participant.id === targetId || !/^[a-zA-Z0-9_-]{1,100}$/.test(targetId)) return "";
  const target = await store.get(participantKey(targetId), {
    type: "json", consistency: "strong",
  }) as EventNetworkRegistration | null;
  if (!target?.aiConsent?.analysis || target.participant.status !== "registered") return "";

  const context = (row: EventNetworkRegistration) => ({
    offers: row.offers.slice(0, 5),
    contribution: row.offersDetail.slice(0, 300),
    needs: row.needs.slice(0, 300),
  });
  if ((!viewer.offersDetail && !viewer.needs) || (!target.offersDetail && !target.needs)) return "";

  const prefix = getNetworkPrefix();
  const key = `${prefix}/introduction-reasons/${viewer.participant.id}/${target.participant.id}.json`;
  const claim = await atomicState(store, key, () => ({ until: 0, reason: "" }), (state) => {
    if (state.until > Date.now()) return { cached: true, reason: state.reason };
    state.until = Date.now() + 60_000;
    return { cached: false, reason: "" };
  });
  if (claim.cached) return claim.reason;
  const reason = await generateIntroductionReason(prefix, context(viewer), context(target));
  if (reason) await atomicState(store, key, () => ({ until: 0, reason: "" }), (state) => {
    state.reason = reason;
    state.until = Date.now() + 60 * 60_000;
  });
  return reason;
}

export async function launchProfilePhoto(
  store: ReturnType<typeof getEventNetworkStore>,
  input: NetworkInput,
  targetId?: string,
) {
  const viewer = await getRegistrationByToken(store, clean(input.accessToken, 100));
  if (!viewer || viewer.participant.status !== "registered") throw Error("Etkinlik oturumu gerekli");
  if (targetId && !/^[a-zA-Z0-9_-]{1,100}$/.test(targetId)) return { photo: "" };
  const key = `${getNetworkPrefix()}/profile-photos/${targetId || viewer.participant.id}.jpg`;
  if (typeof input.photoDataUrl === "string" && !targetId) {
    const photo = input.photoDataUrl;
    if (!photo) { await store.delete(key); return { photo: "" }; }
    if (photo.length > 40_000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo))
      throw Error("Fotoğraf çok büyük veya geçersiz");
    await store.set(key, photo);
    return { photo: "" };
  }
  return { photo: (await store.get(key, { consistency: "strong" })) || "" };
}

export async function createLaunchRecovery(store: ReturnType<typeof getEventNetworkStore>, participantId: string) {
  if (getEventNetworkDatasetInfo().eventSlug !== "14-kasim-2026") throw Error("Geçersiz etkinlik");
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(participantId)) throw Error("Geçersiz katılımcı");
  const row = await store.get(participantKey(participantId), { type: "json", consistency: "strong" }) as EventNetworkRegistration | null;
  if (!row || row.participant.status !== "registered") throw Error("Kayıt bulunamadı");
  const token = randomUUID() + randomUUID();
  await store.setJSON(`${getNetworkPrefix()}/sign-in/${hashToken(token)}.json`, { id: participantId, expires: Date.now() + 15 * 60_000 });
  return { path: `/launch-space#sign-in=${token}` };
}

export async function completeLaunchSignIn(
  store: ReturnType<typeof getEventNetworkStore>,
  token: string,
) {
  if (!/^[a-f0-9-]{72}$/.test(token)) return null;
  const key = `${getNetworkPrefix()}/sign-in/${hashToken(token)}.json`;
  const row = await store.get(key, { type: "json", consistency: "strong" }) as { id: string; expires: number } | null;
  if (!row || row.expires <= Date.now()) return null;
  const registration = await store.get(participantKey(row.id), { type: "json", consistency: "strong" }) as EventNetworkRegistration | null;
  if (!registration || registration.participant.status !== "registered") return null;
  const claimed = await atomicState(store, `${key}.used`, () => ({ at: 0 }), (state) => {
    if (state.at) return false;
    state.at = Date.now();
    return true;
  });
  if (!claimed) return null;
  return resumeNetworkProfile(store, registration.profile.emailNormalized);
}

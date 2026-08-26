import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { getEventProductRuntimeContext } from "./_event-product-context.mjs";

export type FiveCategory =
  | "startup"
  | "marketing"
  | "product"
  | "career"
  | "finance"
  | "team"
  | "creative"
  | "community"
  | "other";

export type FiveIdentity = {
  id: string;
  type: "member" | "event";
  name: string;
  firstName: string;
  username: string;
  email: string;
  publicCode: string;
  photoUrl: string;
  profileUrl: string;
  businessCardEnabled: boolean;
};

export type FiveProblem = {
  id: string;
  shortCode: string;
  eventId: string;
  ownerId: string;
  ownerName: string;
  ownerFirstName: string;
  ownerEmail: string;
  ownerUsername: string;
  ownerPublicCode: string;
  ownerPhotoUrl: string;
  ownerProfileUrl: string;
  ownerBusinessCardEnabled: boolean;
  title: string;
  description: string;
  tried: string;
  desiredOutcome: string;
  category: FiveCategory;
  attending: boolean;
  source: "pre-event" | "live";
  status: "open" | "paused" | "closed";
  signals: string[];
  requestCount: number;
  conversationCount: number;
  consentAt: string;
  createdAt: string;
  updatedAt: string;
};

export type FiveHelpType = "direct" | "experience" | "referral" | "feedback";

export type FiveHelpRequest = {
  id: string;
  eventId: string;
  problemId: string;
  requesterId: string;
  requesterName: string;
  requesterUsername: string;
  requesterPublicCode: string;
  requesterPhotoUrl: string;
  requesterProfileUrl: string;
  requesterBusinessCardEnabled: boolean;
  helpType: FiveHelpType;
  pitch: string;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type FiveEncounterParticipant = Pick<
  FiveIdentity,
  "id" | "name" | "username" | "publicCode" | "photoUrl" | "profileUrl" | "businessCardEnabled"
>;

export type FiveChatMessage = {
  id: string;
  encounterId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderPublicCode: string;
  text: string;
  createdAt: string;
};

export type FiveEncounter = {
  id: string;
  eventId: string;
  problemId: string;
  problemTitle: string;
  owner: FiveEncounterParticipant;
  helpers: FiveEncounterParticipant[];
  requestIds: string[];
  status: "waiting" | "active" | "completed" | "cancelled";
  confirmations: string[];
  extensionVotes: string[];
  extensionUsed: boolean;
  startedAt: string;
  endsAt: string;
  outcome: "solution" | "next-step" | "referral" | "continue-later" | "not-fit" | "";
  createdAt: string;
  updatedAt: string;
  completedAt: string;
};

export type FivePublicProblem = Pick<
  FiveProblem,
  | "id"
  | "shortCode"
  | "ownerFirstName"
  | "title"
  | "description"
  | "category"
  | "attending"
  | "signals"
  | "requestCount"
  | "createdAt"
>;

export type FiveLiveProblem = Omit<FiveProblem, "ownerEmail"> & {
  isOwner: boolean;
  hasRequested: boolean;
};

const storeName = "ntw-five";
const legacyDemoDatasetCode = "five-demo";
const legacyLiveDatasetCode = "five-live";
const requestedDatabaseMode =
  process.env.FIVE_DATABASE?.trim().toLocaleLowerCase("tr-TR") === "live" ||
  process.env.NETLIFY_FIVE_DATABASE?.trim().toLocaleLowerCase("tr-TR") === "live"
    ? "live"
    : "demo";
const directDatasetCode =
  process.env.FIVE_DATASET?.trim() || process.env.NETLIFY_FIVE_DATASET?.trim();
const legacyDatasetCode =
  directDatasetCode ||
  (requestedDatabaseMode === "live" ? legacyLiveDatasetCode : legacyDemoDatasetCode);
const legacyFiveEventId = process.env.FIVE_EVENT_ID?.trim() || "ntw-five-pilot";
const legacyPrefix = `events/${legacyDatasetCode}/${legacyFiveEventId}`;

const categorySignals: Record<FiveCategory, string[]> = {
  startup: ["girişim", "startup", "yatırım", "iş modeli", "müşteri"],
  marketing: ["pazarlama", "satış", "reklam", "marka", "içerik"],
  product: ["ürün", "yazılım", "teknoloji", "uygulama", "yapay zeka"],
  career: ["kariyer", "iş", "staj", "cv", "meslek"],
  finance: ["finans", "bütçe", "nakit", "maliyet", "yatırım"],
  team: ["ekip", "ortak", "kurucu", "çalışan", "liderlik"],
  creative: ["tasarım", "video", "fotoğraf", "yaratıcı", "prodüksiyon"],
  community: ["topluluk", "etkinlik", "network", "insan", "bağlantı"],
  other: ["yeni bakış", "deneyim", "bağlantı"],
};

export function getFiveStore() {
  return getStore({ name: storeName, consistency: "strong" });
}

function getFiveContext() {
  return getEventProductRuntimeContext("five");
}

function getFivePrefix() {
  return getFiveContext()?.keyPrefix || legacyPrefix;
}

export function getFiveEventId() {
  return getFiveContext()?.eventId || legacyFiveEventId;
}

export function getFiveDatasetInfo() {
  const context = getFiveContext();
  if (context) {
    return {
      storeName,
      datasetCode: `${context.eventSlug}-${context.mode}`,
      eventId: context.eventId,
      eventSlug: context.eventSlug,
      prefix: context.keyPrefix,
      activeDatabaseCode: `${context.eventSlug}-${context.mode}`,
      demoDatabaseCode: `${context.eventSlug}-demo`,
      liveDatabaseCode: `${context.eventSlug}-live`,
      keyPrefix: context.keyPrefix,
      mode: context.mode,
    };
  }
  return {
    storeName,
    datasetCode: legacyDatasetCode,
    eventId: legacyFiveEventId,
    eventSlug: legacyFiveEventId,
    prefix: legacyPrefix,
    activeDatabaseCode: legacyDatasetCode,
    demoDatabaseCode: legacyDemoDatasetCode,
    liveDatabaseCode: legacyLiveDatasetCode,
    keyPrefix: legacyPrefix,
    mode: legacyDatasetCode === legacyLiveDatasetCode ? ("live" as const) : ("demo" as const),
  };
}

export function cleanFiveText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

function normalizeEmail(value: unknown) {
  return cleanFiveText(value, 120).toLocaleLowerCase("tr-TR");
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function problemKey(id: string) {
  return `${getFivePrefix()}/problems/${id}.json`;
}

function ownerProblemKey(ownerId: string, id: string) {
  return `${getFivePrefix()}/problem-owners/${hash(ownerId)}/${id}.json`;
}

function requestKey(id: string) {
  return `${getFivePrefix()}/requests/${id}.json`;
}

function problemRequestKey(problemId: string, id: string) {
  return `${getFivePrefix()}/problem-requests/${problemId}/${id}.json`;
}

function requesterRequestKey(requesterId: string, id: string) {
  return `${getFivePrefix()}/requesters/${hash(requesterId)}/${id}.json`;
}

function encounterKey(id: string) {
  return `${getFivePrefix()}/encounters/${id}.json`;
}

function activeEncounterKey(identityId: string) {
  return `${getFivePrefix()}/active/${hash(identityId)}.json`;
}

function encounterMessageKey(encounterId: string, message: FiveChatMessage) {
  return `${getFivePrefix()}/encounter-messages/${encounterId}/${message.createdAt}-${message.id}.json`;
}

async function listJson<T>(prefixValue: string, store = getFiveStore()) {
  const { blobs } = await store.list({ prefix: prefixValue });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" }) as Promise<T>),
  );
  return rows.filter(Boolean);
}

function firstName(name: string) {
  return cleanFiveText(name, 80).split(" ")[0] || "katılımcı";
}

function extractSignals(category: FiveCategory, ...values: string[]) {
  const text = values.join(" ").toLocaleLowerCase("tr-TR");
  const candidates = [...categorySignals[category], ...Object.values(categorySignals).flat()];
  return [...new Set(candidates.filter((signal) => text.includes(signal)))].slice(0, 3).length
    ? [...new Set(candidates.filter((signal) => text.includes(signal)))].slice(0, 3)
    : categorySignals[category].slice(0, 3);
}

function publicProblem(problem: FiveProblem): FivePublicProblem {
  return {
    id: problem.id,
    shortCode: problem.shortCode,
    ownerFirstName: problem.ownerFirstName,
    title: problem.title,
    description: problem.description.slice(0, 180),
    category: problem.category,
    attending: problem.attending,
    signals: problem.signals,
    requestCount: problem.requestCount,
    createdAt: problem.createdAt,
  };
}

function randomProblemCode() {
  return `F${Math.floor(100 + Math.random() * 900)}`;
}

function containsBlockedLanguage(...values: string[]) {
  const normalized = values
    .join(" ")
    .toLocaleLowerCase("tr-TR")
    .replace(/[“”"'.!?;:()[\]{}<>/\\|=+*_~`^%$#@-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const compact = normalized.replace(/\s+/g, "");
  const tokenText = ` ${normalized} `;
  const blockedPatterns = [
    /(^|\s)s[i1]k\w*(\s|$)/,
    /(^|\s)s[iı1]ç\w*(\s|$)/,
    /(^|\s)(am|amk|amc[iı]k\w*|am[iı]na\w*)(\s|$)/,
    /(^|\s)yar+r+ak\w*(\s|$)/,
    /(^|\s)or[o0]spu\w*(\s|$)/,
    /(^|\s)piç\w*(\s|$)/,
    /(^|\s)g[oö]t\w*(\s|$)/,
  ];
  return blockedPatterns.some((pattern) => pattern.test(tokenText)) || /yar+r+ak/.test(compact);
}

export async function createFiveProblem(
  input: {
    name?: string;
    email?: string;
    title?: string;
    description?: string;
    tried?: string;
    desiredOutcome?: string;
    category?: FiveCategory;
    attending?: boolean;
    consent?: boolean;
    source?: "pre-event" | "live";
  },
  identity?: FiveIdentity,
  store = getFiveStore(),
) {
  const name = identity?.name || cleanFiveText(input.name, 80);
  const email = identity?.email || normalizeEmail(input.email);
  const title = cleanFiveText(input.title, 60);
  const description = cleanFiveText(input.description, 240);
  const tried = cleanFiveText(input.tried, 140);
  const desiredOutcome = cleanFiveText(input.desiredOutcome, 100);
  const category = Object.hasOwn(categorySignals, input.category || "")
    ? (input.category as FiveCategory)
    : "other";

  if (name.length < 2) throw new Error("Adını yazmalısın");
  if (!email.includes("@")) throw new Error("Geçerli bir e-posta gerekli");
  if (title.length < 6) throw new Error("Problem başlığı en az 6 karakter olmalı");
  if (description.length < 24) throw new Error("Problemini en az 24 karakterle anlatmalısın");
  if (tried.length < 8) throw new Error("Şimdiye kadar ne denediğini kısaca anlatmalısın");
  if (desiredOutcome.length < 8) throw new Error("Görüşmeden beklediğin sonucu kısaca yazmalısın");
  if (!input.consent) throw new Error("Etkinlik içi paylaşım açık rızası gerekli");
  if (containsBlockedLanguage(title, description, tried, desiredOutcome)) {
    throw new Error("Bu metin topluluk kurallarına uygun değil");
  }

  const ownerId = identity?.id || `public:${hash(email)}`;
  const [ownedProblems, emailProblems] = await Promise.all([
    listJson<FiveProblem>(`${getFivePrefix()}/problem-owners/${hash(ownerId)}/`, store),
    listJson<FiveProblem>(`${getFivePrefix()}/problems/`, store),
  ]);
  const existing = [
    ...new Map(
      [
        ...ownedProblems,
        ...emailProblems.filter((problem) => normalizeEmail(problem.ownerEmail) === email),
      ].map((problem) => [problem.id, problem]),
    ).values(),
  ];
  if (existing.filter((row) => row.status !== "closed").length >= 3) {
    throw new Error("Aynı etkinlik için en fazla üç açık problem bırakabilirsin");
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const problem: FiveProblem = {
    id,
    shortCode: randomProblemCode(),
    eventId: getFiveEventId(),
    ownerId,
    ownerName: name,
    ownerFirstName: identity?.firstName || firstName(name),
    ownerEmail: email,
    ownerUsername: identity?.username || "",
    ownerPublicCode: identity?.publicCode || "",
    ownerPhotoUrl: identity?.photoUrl || "",
    ownerProfileUrl: identity?.profileUrl || "",
    ownerBusinessCardEnabled: Boolean(identity?.businessCardEnabled),
    title,
    description,
    tried,
    desiredOutcome,
    category,
    attending: Boolean(input.attending),
    source: identity ? "live" : input.source || "pre-event",
    status: "open",
    signals: extractSignals(category, title, description, tried, desiredOutcome),
    requestCount: 0,
    conversationCount: 0,
    consentAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await Promise.all([
    store.setJSON(problemKey(id), problem),
    store.setJSON(ownerProblemKey(ownerId, id), problem),
  ]);
  return problem;
}

export async function syncFiveProblemsForIdentity(identity: FiveIdentity, store = getFiveStore()) {
  const email = normalizeEmail(identity.email);
  if (!email) return [];

  const problems = await listJson<FiveProblem>(`${getFivePrefix()}/problems/`, store);
  const matchingProblems = problems.filter(
    (problem) => normalizeEmail(problem.ownerEmail) === email,
  );

  await Promise.all(
    matchingProblems.flatMap((problem) => {
      const nextProblem: FiveProblem = {
        ...problem,
        ownerName: identity.name,
        ownerFirstName: identity.firstName,
        ownerEmail: email,
        ownerUsername: identity.username,
        ownerPublicCode: identity.publicCode,
        ownerPhotoUrl: identity.photoUrl,
        ownerProfileUrl: identity.profileUrl,
        ownerBusinessCardEnabled: identity.businessCardEnabled,
        attending: true,
        updatedAt: new Date().toISOString(),
      };
      return [
        store.setJSON(problemKey(problem.id), nextProblem),
        store.setJSON(ownerProblemKey(problem.ownerId, problem.id), nextProblem),
      ];
    }),
  );

  return matchingProblems.map((problem) => problem.id);
}

export async function getFivePublicBoard(store = getFiveStore()) {
  const problems = (await listJson<FiveProblem>(`${getFivePrefix()}/problems/`, store))
    .filter((problem) => problem.status === "open")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const categoryCounts = problems.reduce<Record<string, number>>((counts, problem) => {
    counts[problem.category] = (counts[problem.category] || 0) + 1;
    return counts;
  }, {});
  return {
    eventId: getFiveEventId(),
    problems: problems.slice(0, 24).map(publicProblem),
    stats: {
      total: problems.length,
      attending: problems.filter((problem) => problem.attending).length,
      categories: Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([category, count]) => ({ category, count })),
    },
  };
}

export async function getFiveLiveBoard(identity: FiveIdentity, store = getFiveStore()) {
  const [problems, requests] = await Promise.all([
    listJson<FiveProblem>(`${getFivePrefix()}/problems/`, store),
    listJson<FiveHelpRequest>(`${getFivePrefix()}/requesters/${hash(identity.id)}/`, store),
  ]);
  const requested = new Set(requests.map((request) => request.problemId));
  return problems
    .filter((problem) => problem.status === "open")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((problem): FiveLiveProblem => {
      const { ownerEmail, ...safeProblem } = problem;
      return {
        ...safeProblem,
        isOwner: problem.ownerId === identity.id || ownerEmail === identity.email,
        hasRequested: requested.has(problem.id),
      };
    });
}

export async function createFiveHelpRequest(
  identity: FiveIdentity,
  input: { problemId?: string; helpType?: FiveHelpType; pitch?: string },
  store = getFiveStore(),
) {
  const problemId = cleanFiveText(input.problemId, 80);
  const helpType: FiveHelpType = ["direct", "experience", "referral", "feedback"].includes(
    input.helpType || "",
  )
    ? (input.helpType as FiveHelpType)
    : "feedback";
  const pitch = cleanFiveText(input.pitch, 120);
  const problem = (await store.get(problemKey(problemId), {
    type: "json",
    consistency: "strong",
  })) as FiveProblem | null;
  if (!problem || problem.status !== "open") throw new Error("Problem artık açık değil");
  if (problem.ownerId === identity.id || problem.ownerEmail === identity.email) {
    throw new Error("Kendi problemine yardım talebi gönderemezsin");
  }
  if (pitch.length < 12) throw new Error("Nasıl katkı sağlayacağını en az 12 karakterle anlat");
  if (containsBlockedLanguage(pitch)) throw new Error("Bu metin topluluk kurallarına uygun değil");
  const existing = (
    await listJson<FiveHelpRequest>(`${getFivePrefix()}/requesters/${hash(identity.id)}/`, store)
  ).find((request) => request.problemId === problemId && request.status !== "cancelled");
  if (existing) throw new Error("Bu problem için zaten talep gönderdin");

  const now = new Date().toISOString();
  const request: FiveHelpRequest = {
    id: crypto.randomUUID(),
    eventId: getFiveEventId(),
    problemId,
    requesterId: identity.id,
    requesterName: identity.name,
    requesterUsername: identity.username,
    requesterPublicCode: identity.publicCode,
    requesterPhotoUrl: identity.photoUrl,
    requesterProfileUrl: identity.profileUrl,
    requesterBusinessCardEnabled: identity.businessCardEnabled,
    helpType,
    pitch,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  problem.requestCount += 1;
  problem.updatedAt = now;
  await Promise.all([
    store.setJSON(requestKey(request.id), request),
    store.setJSON(problemRequestKey(problemId, request.id), request),
    store.setJSON(requesterRequestKey(identity.id, request.id), request),
    store.setJSON(problemKey(problem.id), problem),
    store.setJSON(ownerProblemKey(problem.ownerId, problem.id), problem),
  ]);
  return request;
}

async function getActiveEncounter(identityId: string, store = getFiveStore()) {
  const activeId = await store.get(activeEncounterKey(identityId), { consistency: "strong" });
  if (!activeId) return null;
  return (await store.get(encounterKey(String(activeId)), {
    type: "json",
    consistency: "strong",
  })) as FiveEncounter | null;
}

export async function getFiveMyState(identity: FiveIdentity, store = getFiveStore()) {
  const ownedProblems = (
    await listJson<FiveProblem>(`${getFivePrefix()}/problem-owners/${hash(identity.id)}/`, store)
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const emailProblems = identity.email
    ? (await listJson<FiveProblem>(`${getFivePrefix()}/problems/`, store)).filter(
        (problem) => problem.ownerEmail === identity.email,
      )
    : [];
  const allOwned = [
    ...new Map([...ownedProblems, ...emailProblems].map((row) => [row.id, row])).values(),
  ];
  const incoming = (
    await Promise.all(
      allOwned.map((problem) =>
        listJson<FiveHelpRequest>(`${getFivePrefix()}/problem-requests/${problem.id}/`, store),
      ),
    )
  )
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const outgoing = (
    await listJson<FiveHelpRequest>(`${getFivePrefix()}/requesters/${hash(identity.id)}/`, store)
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const activeEncounter = await getActiveEncounter(identity.id, store);
  const activeEncounterMessages = activeEncounter
    ? (
        await listJson<FiveChatMessage>(
          `${getFivePrefix()}/encounter-messages/${activeEncounter.id}/`,
          store,
        )
      ).sort((first, second) => first.createdAt.localeCompare(second.createdAt))
    : [];
  return {
    identity,
    ownedProblems: allOwned,
    incoming,
    outgoing,
    activeEncounter,
    activeEncounterMessages,
  };
}

export async function acceptFiveHelpRequest(
  identity: FiveIdentity,
  requestId: string,
  store = getFiveStore(),
) {
  const request = (await store.get(requestKey(cleanFiveText(requestId, 80)), {
    type: "json",
    consistency: "strong",
  })) as FiveHelpRequest | null;
  if (!request || request.status !== "pending") throw new Error("Talep artık beklemiyor");
  const problem = (await store.get(problemKey(request.problemId), {
    type: "json",
    consistency: "strong",
  })) as FiveProblem | null;
  if (!problem || (problem.ownerId !== identity.id && problem.ownerEmail !== identity.email)) {
    throw new Error("Bu talebi yalnızca problem sahibi kabul edebilir");
  }
  if (await getActiveEncounter(request.requesterId, store)) {
    throw new Error("Bu kişi şu anda başka bir görüşmede");
  }

  let encounter = await getActiveEncounter(identity.id, store);
  if (encounter && (encounter.status !== "waiting" || encounter.problemId !== problem.id)) {
    throw new Error("Önce mevcut görüşmeni tamamlamalısın");
  }
  if (encounter?.helpers.length === 2)
    throw new Error("Bu görüşme için iki yardımcı zaten seçildi");

  const now = new Date().toISOString();
  const helper: FiveEncounterParticipant = {
    id: request.requesterId,
    name: request.requesterName,
    username: request.requesterUsername,
    publicCode: request.requesterPublicCode,
    photoUrl: request.requesterPhotoUrl || "",
    profileUrl: request.requesterProfileUrl || "",
    businessCardEnabled: Boolean(request.requesterBusinessCardEnabled),
  };
  if (!encounter) {
    encounter = {
      id: crypto.randomUUID(),
      eventId: getFiveEventId(),
      problemId: problem.id,
      problemTitle: problem.title,
      owner: {
        id: identity.id,
        name: identity.name,
        username: identity.username,
        publicCode: identity.publicCode,
        photoUrl: identity.photoUrl,
        profileUrl: identity.profileUrl,
        businessCardEnabled: identity.businessCardEnabled,
      },
      helpers: [helper],
      requestIds: [request.id],
      status: "waiting",
      confirmations: [],
      extensionVotes: [],
      extensionUsed: false,
      startedAt: "",
      endsAt: "",
      outcome: "",
      createdAt: now,
      updatedAt: now,
      completedAt: "",
    };
  } else {
    encounter.helpers = [...encounter.helpers, helper];
    encounter.requestIds = [...encounter.requestIds, request.id];
    encounter.updatedAt = now;
  }
  request.status = "accepted";
  request.updatedAt = now;
  await Promise.all([
    store.setJSON(encounterKey(encounter.id), encounter),
    store.set(activeEncounterKey(identity.id), encounter.id),
    store.set(activeEncounterKey(request.requesterId), encounter.id),
    store.setJSON(requestKey(request.id), request),
    store.setJSON(problemRequestKey(problem.id, request.id), request),
    store.setJSON(requesterRequestKey(request.requesterId, request.id), request),
  ]);
  return encounter;
}

export async function sendFiveChatMessage(
  identity: FiveIdentity,
  messageValue: unknown,
  store = getFiveStore(),
) {
  const encounter = await getActiveEncounter(identity.id, store);
  if (!encounter || !["waiting", "active"].includes(encounter.status)) {
    throw new Error("Mesaj gönderilecek aktif görüşme bulunamadı");
  }
  if (!encounterParticipantIds(encounter).includes(identity.id)) {
    throw new Error("Bu görüşmede değilsin");
  }
  const text = cleanFiveText(messageValue, 240);
  if (text.length < 2) throw new Error("Mesaj en az 2 karakter olmalı");
  if (containsBlockedLanguage(text)) throw new Error("Bu mesaj topluluk kurallarına uygun değil");
  const message: FiveChatMessage = {
    id: crypto.randomUUID(),
    encounterId: encounter.id,
    senderId: identity.id,
    senderName: identity.name,
    senderUsername: identity.username,
    senderPublicCode: identity.publicCode,
    text,
    createdAt: new Date().toISOString(),
  };
  await store.setJSON(encounterMessageKey(encounter.id, message), message);
  return message;
}

export async function createFiveDemoEncounter(identity: FiveIdentity, store = getFiveStore()) {
  const existing = await getActiveEncounter(identity.id, store);
  if (existing) return existing;

  const now = new Date();
  const encounter: FiveEncounter = {
    id: crypto.randomUUID(),
    eventId: getFiveEventId(),
    problemId: "demo-problem",
    problemTitle: "Yeni müşterilere ulaşırken doğru bağlantıyı nasıl bulabilirim?",
    owner: {
      id: identity.id,
      name: identity.name,
      username: identity.username,
      publicCode: identity.publicCode,
      photoUrl: identity.photoUrl,
      profileUrl: identity.profileUrl,
      businessCardEnabled: identity.businessCardEnabled,
    },
    helpers: [
      {
        id: "demo:selin",
        name: "Selin Aras",
        username: "selin-aras",
        publicCode: "D14",
        photoUrl: "",
        profileUrl: "/u/selin-aras",
        businessCardEnabled: true,
      },
      {
        id: "demo:mert",
        name: "Mert Deniz",
        username: "mert-deniz",
        publicCode: "D27",
        photoUrl: "",
        profileUrl: "/u/mert-deniz",
        businessCardEnabled: true,
      },
    ],
    requestIds: [],
    status: "active",
    confirmations: [identity.id, "demo:selin", "demo:mert"],
    extensionVotes: [],
    extensionUsed: false,
    startedAt: now.toISOString(),
    endsAt: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
    outcome: "",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    completedAt: "",
  };
  const demoMessages: FiveChatMessage[] = [
    {
      id: crypto.randomUUID(),
      encounterId: encounter.id,
      senderId: "demo:selin",
      senderName: "Selin Aras",
      senderUsername: "selin-aras",
      senderPublicCode: "D14",
      text: "Sahnenin sağındaki turkuaz panonun yanındayım.",
      createdAt: new Date(now.getTime() + 100).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      encounterId: encounter.id,
      senderId: "demo:mert",
      senderName: "Mert Deniz",
      senderUsername: "mert-deniz",
      senderPublicCode: "D27",
      text: "Ben de geliyorum, iki dakika içinde oradayım.",
      createdAt: new Date(now.getTime() + 200).toISOString(),
    },
  ];
  await Promise.all([
    store.setJSON(encounterKey(encounter.id), encounter),
    store.set(activeEncounterKey(identity.id), encounter.id),
    ...demoMessages.map((message) =>
      store.setJSON(encounterMessageKey(encounter.id, message), message),
    ),
  ]);
  return encounter;
}

function encounterParticipantIds(encounter: FiveEncounter) {
  return [encounter.owner.id, ...encounter.helpers.map((helper) => helper.id)];
}

export async function confirmFiveEncounter(identity: FiveIdentity, store = getFiveStore()) {
  const encounter = await getActiveEncounter(identity.id, store);
  if (!encounter || encounter.status !== "waiting") throw new Error("Bekleyen görüşme bulunamadı");
  const participantIds = encounterParticipantIds(encounter);
  if (!participantIds.includes(identity.id)) throw new Error("Bu görüşmede değilsin");
  encounter.confirmations = [...new Set([...encounter.confirmations, identity.id])];
  const now = new Date();
  if (participantIds.every((id) => encounter.confirmations.includes(id))) {
    encounter.status = "active";
    encounter.startedAt = now.toISOString();
    encounter.endsAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
  }
  encounter.updatedAt = now.toISOString();
  await store.setJSON(encounterKey(encounter.id), encounter);
  return encounter;
}

export async function voteFiveExtension(identity: FiveIdentity, store = getFiveStore()) {
  const encounter = await getActiveEncounter(identity.id, store);
  if (!encounter || encounter.status !== "active") throw new Error("Aktif görüşme bulunamadı");
  if (encounter.extensionUsed) throw new Error("Bu görüşmede uzatma hakkı kullanıldı");
  const participantIds = encounterParticipantIds(encounter);
  encounter.extensionVotes = [...new Set([...encounter.extensionVotes, identity.id])];
  if (participantIds.every((id) => encounter.extensionVotes.includes(id))) {
    encounter.extensionUsed = true;
    encounter.endsAt = new Date(Date.parse(encounter.endsAt) + 5 * 60 * 1000).toISOString();
  }
  encounter.updatedAt = new Date().toISOString();
  await store.setJSON(encounterKey(encounter.id), encounter);
  return encounter;
}

export async function completeFiveEncounter(
  identity: FiveIdentity,
  outcome: FiveEncounter["outcome"],
  store = getFiveStore(),
) {
  const encounter = await getActiveEncounter(identity.id, store);
  if (!encounter || !["waiting", "active"].includes(encounter.status)) {
    throw new Error("Tamamlanacak görüşme bulunamadı");
  }
  if (!["solution", "next-step", "referral", "continue-later", "not-fit"].includes(outcome)) {
    throw new Error("Görüşme sonucunu seçmelisin");
  }
  const now = new Date().toISOString();
  encounter.status = "completed";
  encounter.outcome = outcome;
  encounter.completedAt = now;
  encounter.updatedAt = now;
  const problem = (await store.get(problemKey(encounter.problemId), {
    type: "json",
    consistency: "strong",
  })) as FiveProblem | null;
  if (problem) {
    problem.conversationCount += 1;
    problem.updatedAt = now;
  }
  const requests = await Promise.all(
    encounter.requestIds.map(
      (id) =>
        store.get(requestKey(id), {
          type: "json",
          consistency: "strong",
        }) as Promise<FiveHelpRequest | null>,
    ),
  );
  await Promise.all([
    store.setJSON(encounterKey(encounter.id), encounter),
    ...encounterParticipantIds(encounter).map((id) => store.delete(activeEncounterKey(id))),
    ...(problem
      ? [
          store.setJSON(problemKey(problem.id), problem),
          store.setJSON(ownerProblemKey(problem.ownerId, problem.id), problem),
        ]
      : []),
    ...requests.flatMap((request) => {
      if (!request) return [];
      request.status = "completed";
      request.updatedAt = now;
      return [
        store.setJSON(requestKey(request.id), request),
        store.setJSON(problemRequestKey(request.problemId, request.id), request),
        store.setJSON(requesterRequestKey(request.requesterId, request.id), request),
      ];
    }),
  ]);
  return encounter;
}

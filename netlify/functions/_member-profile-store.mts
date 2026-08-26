import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getStore } from "@netlify/blobs";
import seedMembers from "../data/networking-seed.json" with { type: "json" };

const scrypt = promisify(scryptCallback);
const liveProfileStoreName = "notwork-member-profiles";
const demoProfileStoreName = "notwork-member-profiles-demo";
const requestedProfileDatabaseMode =
  process.env.MEMBER_PROFILE_DATABASE?.trim().toLocaleLowerCase("tr-TR") === "demo" ||
  process.env.NETLIFY_MEMBER_PROFILE_DATABASE?.trim().toLocaleLowerCase("tr-TR") === "demo"
    ? "demo"
    : "live";
const directProfileStoreName =
  process.env.MEMBER_PROFILE_STORE?.trim() || process.env.NETLIFY_MEMBER_PROFILE_STORE?.trim();
const profileStoreName =
  directProfileStoreName ||
  (requestedProfileDatabaseMode === "demo" ? demoProfileStoreName : liveProfileStoreName);
const profileDatabaseMode = directProfileStoreName
  ? profileStoreName === liveProfileStoreName
    ? "live"
    : "demo"
  : requestedProfileDatabaseMode;
const liveMemberStoreName = "networking-members";
const demoMemberStoreName = "networking-members-demo";
const memberStoreName =
  process.env.MEMBER_SOURCE_STORE?.trim() ||
  process.env.NETLIFY_MEMBER_SOURCE_STORE?.trim() ||
  (profileDatabaseMode === "demo" ? demoMemberStoreName : liveMemberStoreName);
const eventNetworkStoreName = "event-network";
const demoEventNetworkDataset = "21agustos-demo";
const liveEventNetworkDataset = "21agustoscanli";

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

type StoredCredential = {
  algorithm: "scrypt-v1";
  salt: string;
  hash: string;
};

type StoredSession = {
  tokenHash: string;
  username: string;
  createdAt: string;
  expiresAt: string;
};

type StoredMemberEventCode = {
  eventId: string;
  code: string;
  issuedAt: string;
};

type EventNetworkRegistration = {
  profile?: {
    id?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    emailNormalized?: string;
    attendedEvent?: string;
  };
  participant?: {
    id?: string;
    eventId?: string;
    publicCode?: string;
    registeredAt?: string;
  };
  offers?: string[];
  intro?: string;
  offersDetail?: string;
  needs?: string;
  needTag?: string;
};

type CompletedEventMatch = {
  id?: string;
  participantIds?: string[];
  completedAt?: string;
};

export type StoredMemberProfile = {
  id: string;
  memberId: string;
  username: string;
  email: string;
  phone?: string;
  name: string;
  headline: string;
  bio: string;
  photoUrl: string;
  skills: string[];
  experiences: Array<{ company: string; role: string }>;
  links: {
    linkedin: string;
    instagram: string;
    website: string;
  };
  attendedEvents: string[];
  eventCodes: StoredMemberEventCode[];
  verifiedMember: boolean;
  publicProfileEnabled: boolean;
  badge?: {
    code: "verified-event-member";
    label: "Doğrulanmış Notwork Üyesi";
    description: string;
  };
  membershipSource?: "event-qr" | "profile-application" | "event-import";
  autoApprovedEventId?: string;
  status: "invited" | "pending" | "active" | "suspended" | "rejected";
  credential?: StoredCredential;
  mustChangePassword: boolean;
  registration?: {
    attendedEventClaim: string;
    introduction: string;
    lookingFor: string;
    canHelpWith: string;
    referrer: string;
    submittedAt: string;
    reviewedAt: string;
  };
  credentialIssuedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type TemporaryMemberCredential = {
  name: string;
  email: string;
  username: string;
  temporaryPassword: string;
};

export type ImportedMemberCredential = {
  email: string;
  username: string;
  credential: StoredCredential;
};

export type StoredMemberReference = {
  id: string;
  targetUsername: string;
  authorUsername: string;
  authorName: string;
  skill: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  reviewedAt: string;
};

function profileKey(username: string) {
  return `profiles/${username}.json`;
}

function profileEmailKey(email: string) {
  return `profile-emails/${hashToken(email)}.json`;
}

function sessionKey(tokenHash: string) {
  return `sessions/${tokenHash}.json`;
}

function photoKey(profileId: string) {
  return `photos/${profileId}`;
}

function referenceKey(targetUsername: string, authorUsername: string) {
  return `references/${targetUsername}/${authorUsername}.json`;
}

function activeEventNetworkDataset() {
  return (
    process.env.EVENT_NETWORK_DATASET?.trim() ||
    process.env.NETLIFY_EVENT_NETWORK_DATASET?.trim() ||
    (profileDatabaseMode === "demo" ? demoEventNetworkDataset : liveEventNetworkDataset)
  );
}

function eventNetworkProfileKey(email: string) {
  return `events/${activeEventNetworkDataset()}/network/profiles/${encodeURIComponent(email)}.json`;
}

function eventNetworkParticipantKey(participantId: string) {
  return `events/${activeEventNetworkDataset()}/network/participants/${participantId}.json`;
}

function completedEventMatchesPrefix() {
  return `events/${activeEventNetworkDataset()}/network/completed-matches/`;
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function inferAttendedEvents(member: NetworkMemberRow) {
  const raw = normalizeText(
    `${member.contact || ""} ${member.motivation || ""} ${member.title || ""}`,
  );
  const events = new Set<string>();
  const createdAt = member.createdAt ? new Date(member.createdAt) : null;

  if (
    raw.includes("event:14temmuznetworking") ||
    raw.includes("14 temmuz") ||
    (createdAt?.getFullYear() === 2026 && createdAt.getMonth() === 6 && createdAt.getDate() === 14)
  ) {
    events.add("14-temmuz-2026");
  }

  if (
    raw.includes("event:21agustos") ||
    raw.includes("event:21-agustos") ||
    raw.includes("21 agustos") ||
    (createdAt?.getFullYear() === 2026 && createdAt.getMonth() === 7 && createdAt.getDate() === 21)
  ) {
    events.add("21-agustos-2026");
  }

  return [...events];
}

function publicProfile(profile: StoredMemberProfile) {
  const { credential: _credential, ...safeProfile } = profile;
  return { ...safeProfile, eventCodes: safeProfile.eventCodes || [] };
}

function shareableProfile(profile: StoredMemberProfile) {
  return {
    username: profile.username,
    name: profile.name,
    headline: profile.headline,
    bio: profile.bio,
    photoUrl: profile.photoUrl
      ? `/api/member-profile?publicPhoto=${encodeURIComponent(profile.username)}&v=${encodeURIComponent(profile.updatedAt)}`
      : "",
    skills: profile.skills,
    experiences: profile.experiences,
    links: profile.links,
    attendedEvents: profile.attendedEvents,
    verifiedMember: profile.verifiedMember,
    badge: profile.badge,
  };
}

async function hydrateMemberEventCodes(
  profile: StoredMemberProfile,
  store = getMemberProfileStore(),
) {
  const eventStore = getStore({ name: eventNetworkStoreName, consistency: "strong" });
  const registration = (await eventStore.get(eventNetworkProfileKey(profile.email), {
    type: "json",
    consistency: "strong",
  })) as EventNetworkRegistration | null;
  const code = clean(registration?.participant?.publicCode, 16).toUpperCase();
  const eventId = clean(
    registration?.participant?.eventId || registration?.profile?.attendedEvent,
    80,
  );
  if (!code || !eventId) {
    return { ...profile, eventCodes: profile.eventCodes || [] };
  }

  const nextCode: StoredMemberEventCode = {
    eventId,
    code,
    issuedAt: clean(registration?.participant?.registeredAt, 40),
  };
  const existingCodes = profile.eventCodes || [];
  const nextCodes = [
    ...existingCodes.filter((eventCode) => eventCode.eventId !== eventId),
    nextCode,
  ].sort((first, second) => second.issuedAt.localeCompare(first.issuedAt));
  const unchanged = JSON.stringify(existingCodes) === JSON.stringify(nextCodes);
  if (unchanged) return profile;

  const hydratedProfile: StoredMemberProfile = {
    ...profile,
    eventCodes: nextCodes,
    updatedAt: new Date().toISOString(),
  };
  await store.setJSON(profileKey(profile.username), hydratedProfile);
  return hydratedProfile;
}

function publicReference(reference: StoredMemberReference) {
  return {
    id: reference.id,
    authorUsername: reference.authorUsername,
    authorName: reference.authorName,
    skill: reference.skill,
    message: reference.message,
    createdAt: reference.createdAt,
  };
}

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function getRows<T>(store: ReturnType<typeof getStore>, prefix: string) {
  const { blobs } = await store.list({ prefix });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );
  return rows.filter(Boolean) as T[];
}

export function getMemberProfileStore() {
  return getStore({ name: profileStoreName, consistency: "strong" });
}

export function getMemberProfileDatabaseInfo() {
  return {
    storeName: profileStoreName,
    memberSourceStoreName: memberStoreName,
    eventNetworkStoreName,
    eventNetworkDataset: activeEventNetworkDataset(),
    activeDatabaseCode: profileStoreName,
    demoDatabaseCode: demoProfileStoreName,
    liveDatabaseCode: liveProfileStoreName,
    mode: profileDatabaseMode,
  };
}

export async function listMemberProfiles(store = getMemberProfileStore()) {
  const profiles = await getRows<StoredMemberProfile>(store, "profiles/");
  return profiles
    .map(publicProfile)
    .sort((first, second) => first.name.localeCompare(second.name, "tr"));
}

export async function listMemberReferences(store = getMemberProfileStore()) {
  const references = await getRows<StoredMemberReference>(store, "references/");
  return references.sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function getMemberConnections(
  profile: StoredMemberProfile,
  store = getMemberProfileStore(),
) {
  const eventStore = getStore({ name: eventNetworkStoreName, consistency: "strong" });
  const registration = (await eventStore.get(eventNetworkProfileKey(profile.email), {
    type: "json",
    consistency: "strong",
  })) as EventNetworkRegistration | null;
  const participantId = clean(registration?.participant?.id, 100);
  if (!participantId) return [];

  const completedMatches = await getRows<CompletedEventMatch>(
    eventStore,
    completedEventMatchesPrefix(),
  );
  const sharedGroupsByParticipant = new Map<string, number>();
  for (const match of completedMatches) {
    const participantIds = Array.isArray(match.participantIds)
      ? match.participantIds.map((id) => clean(id, 100)).filter(Boolean)
      : [];
    if (!participantIds.includes(participantId)) continue;
    for (const connectionId of participantIds) {
      if (connectionId === participantId) continue;
      sharedGroupsByParticipant.set(
        connectionId,
        (sharedGroupsByParticipant.get(connectionId) || 0) + 1,
      );
    }
  }
  if (!sharedGroupsByParticipant.size) return [];

  const [profiles, sourceMembers, connectionRegistrations] = await Promise.all([
    getRows<StoredMemberProfile>(store, "profiles/"),
    listSourceMembers(),
    Promise.all(
      [...sharedGroupsByParticipant.keys()].map((connectionId) =>
        eventStore.get(eventNetworkParticipantKey(connectionId), {
          type: "json",
          consistency: "strong",
        }),
      ),
    ) as Promise<Array<EventNetworkRegistration | null>>,
  ]);
  const profilesByEmail = new Map(
    profiles.map((memberProfile) => [memberProfile.email, memberProfile]),
  );
  const sourceMembersByEmail = new Map(
    sourceMembers.map((member) => [clean(member.email, 120).toLocaleLowerCase("tr-TR"), member]),
  );

  return connectionRegistrations
    .filter((row): row is EventNetworkRegistration => Boolean(row?.participant?.id))
    .map((row) => {
      const email = clean(
        row.profile?.emailNormalized || row.profile?.email,
        120,
      ).toLocaleLowerCase("tr-TR");
      const memberProfile = profilesByEmail.get(email);
      const sourceMember = sourceMembersByEmail.get(email);
      const username = clean(
        memberProfile?.username || row.profile?.username || sourceMember?.username,
        80,
      ).toLocaleLowerCase("tr-TR");
      const name = clean(
        memberProfile?.name ||
          sourceMember?.name ||
          `${row.profile?.firstName || ""} ${row.profile?.lastName || ""}`,
        100,
      );
      return {
        id: clean(row.participant?.id, 100),
        username,
        name,
        headline: clean(memberProfile?.headline || sourceMember?.title, 120),
        photoUrl:
          memberProfile?.photoUrl && username
            ? `/api/member-profile?networkPhoto=${encodeURIComponent(username)}&v=${encodeURIComponent(memberProfile.updatedAt)}`
            : "",
        email,
        instagram: clean(memberProfile?.links.instagram || sourceMember?.instagram, 100).replace(
          /^@/,
          "",
        ),
        linkedin: clean(memberProfile?.links.linkedin || sourceMember?.linkedin, 240),
        website: clean(memberProfile?.links.website, 240),
        phone: clean(memberProfile?.phone || sourceMember?.contact, 80),
        eventId: clean(row.participant?.eventId, 80),
        publicCode: clean(row.participant?.publicCode, 16).toUpperCase(),
        sharedGroupCount: sharedGroupsByParticipant.get(clean(row.participant?.id, 100)) || 1,
        publicProfileEnabled: Boolean(
          memberProfile?.status === "active" &&
          !memberProfile.mustChangePassword &&
          memberProfile.publicProfileEnabled,
        ),
      };
    })
    .filter((connection) => connection.name)
    .sort((first, second) => {
      const sharedDifference = second.sharedGroupCount - first.sharedGroupCount;
      return sharedDifference || first.name.localeCompare(second.name, "tr");
    });
}

async function listSourceMembers() {
  const store = getStore({ name: memberStoreName, consistency: "strong" });
  const rows = await getRows<NetworkMemberRow>(store, "members/");
  if (rows.length || process.env.NETLIFY_DEV !== "true") return rows;
  return (seedMembers as NetworkMemberRow[]).map((member) => ({
    ...member,
    contact: `${member.contact || ""} || event:21agustos`,
  }));
}

function sourceMemberScore(member: NetworkMemberRow) {
  return [
    member.name,
    member.title,
    member.skills,
    member.instagram,
    member.linkedin,
    member.motivation,
    member.contact,
  ].reduce((score, value) => score + (clean(value, 240) ? 1 : 0), 0);
}

function groupSourceMembersByEmail(sourceMembers: NetworkMemberRow[]) {
  const grouped = new Map<string, NetworkMemberRow[]>();

  for (const member of sourceMembers) {
    const email = clean(member.email, 120).toLocaleLowerCase("tr-TR");
    if (!email) continue;
    grouped.set(email, [...(grouped.get(email) || []), member]);
  }

  return [...grouped.entries()].map(([email, members]) => {
    const sorted = [...members].sort((first, second) => {
      const scoreDifference = sourceMemberScore(second) - sourceMemberScore(first);
      if (scoreDifference !== 0) return scoreDifference;
      return (first.createdAt || "").localeCompare(second.createdAt || "");
    });
    const primary = sorted[0];
    const stableUsername = [...members]
      .sort((first, second) => (first.createdAt || "").localeCompare(second.createdAt || ""))
      .map((member) => clean(member.username, 80).toLocaleLowerCase("tr-TR"))
      .find(Boolean);

    return {
      member: { ...primary, email, username: stableUsername || "" },
      attendedEvents: [...new Set(members.flatMap(inferAttendedEvents))],
    };
  });
}

export async function syncVerifiedEventMembers(store = getMemberProfileStore()) {
  const sourceMembers = await listSourceMembers();
  const existingProfiles = await getRows<StoredMemberProfile>(store, "profiles/");
  const existingByEmail = new Map(existingProfiles.map((profile) => [profile.email, profile]));
  let syncedCount = 0;

  for (const { member, attendedEvents } of groupSourceMembersByEmail(sourceMembers)) {
    const email = member.email;
    const existingByEmailProfile = existingByEmail.get(email);
    const username =
      existingByEmailProfile?.username || clean(member.username, 80).toLocaleLowerCase("tr-TR");
    if (!username || !email) continue;

    const existing =
      existingByEmailProfile ||
      ((await store.get(profileKey(username), {
        type: "json",
        consistency: "strong",
      })) as StoredMemberProfile | null);
    const now = new Date().toISOString();
    const verifiedMember = existing?.verifiedMember || attendedEvents.length > 0;
    const profile: StoredMemberProfile = {
      id: existing?.id || crypto.randomUUID(),
      memberId: member.id,
      username,
      email,
      phone: existing?.phone || clean(member.contact, 80),
      name: clean(member.name, 100),
      headline: existing?.headline || clean(member.title, 120),
      bio: existing?.bio || clean(member.motivation, 240),
      photoUrl: existing?.photoUrl || "",
      skills: existing?.skills?.length
        ? existing.skills.slice(0, 5)
        : clean(member.skills, 240)
            .split(/[,;]/g)
            .map((skill) => skill.trim())
            .filter(Boolean)
            .slice(0, 5),
      experiences: existing?.experiences || [],
      links: {
        linkedin: existing?.links.linkedin || clean(member.linkedin, 240),
        instagram: existing?.links.instagram || clean(member.instagram, 100),
        website: existing?.links.website || "",
      },
      attendedEvents: [...new Set([...(existing?.attendedEvents || []), ...attendedEvents])],
      eventCodes: existing?.eventCodes || [],
      verifiedMember,
      publicProfileEnabled: existing?.publicProfileEnabled ?? false,
      badge: verifiedMember
        ? {
            code: "verified-event-member",
            label: "Doğrulanmış Notwork Üyesi",
            description: "Etkinlik katılımı veya üye referansı admin tarafından doğrulandı.",
          }
        : undefined,
      membershipSource: existing?.membershipSource || "event-import",
      autoApprovedEventId: existing?.autoApprovedEventId,
      status: existing?.status || "invited",
      credential: existing?.credential,
      mustChangePassword: existing?.mustChangePassword ?? true,
      registration: existing?.registration,
      credentialIssuedAt: existing?.credentialIssuedAt || "",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    await Promise.all([
      store.setJSON(profileKey(username), await hydrateMemberEventCodes(profile, store)),
      store.setJSON(profileEmailKey(email), { username }),
    ]);
    existingByEmail.set(email, profile);
    syncedCount += 1;
  }

  return { sourceCount: sourceMembers.length, syncedCount };
}

function createTemporaryPassword() {
  return `NTW-${randomBytes(4).toString("hex").toUpperCase()}-${randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
}

async function hashPassword(password: string): Promise<StoredCredential> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return {
    algorithm: "scrypt-v1",
    salt,
    hash: derived.toString("hex"),
  };
}

async function verifyPassword(password: string, credential?: StoredCredential) {
  if (!credential || credential.algorithm !== "scrypt-v1") return false;
  const derived = (await scrypt(password, credential.salt, 64)) as Buffer;
  const expected = Buffer.from(credential.hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

type NewMemberRegistration = {
  name?: string;
  email?: string;
  password?: string;
  attendedEventClaim?: string;
  introduction?: string;
  lookingFor?: string;
  canHelpWith?: string;
  linkedin?: string;
  instagram?: string;
  phone?: string;
  referrer?: string;
  photoDataUrl?: string;
  consent?: boolean;
};

const allowedEventClaims = new Set([
  "referral",
  "21-agustos-2026",
  "14-temmuz-2026",
  "22-mayis-2026",
  "10-nisan-2026",
  "8-mart-2026",
  "10-subat-2026",
  "16-ocak-2026",
  "8-aralik-2025",
]);

function registrationUsername(name: string) {
  return (
    normalizeText(name)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "notwork-uye"
  );
}

function profilePhotoPayload(photoDataUrl: string) {
  const match = photoDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Profil fotoğrafı zorunludur. JPG, PNG veya WebP seç.");
  const image = Buffer.from(match[2], "base64");
  if (image.byteLength > 700_000) throw new Error("Profil fotoğrafı en fazla 700 KB olabilir");
  return { image, contentType: match[1] };
}

async function createMemberSession(profile: StoredMemberProfile, store = getMemberProfileStore()) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = new Date();
  const session: StoredSession = {
    tokenHash,
    username: profile.username,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  await store.setJSON(sessionKey(tokenHash), session);
  return { profile: publicProfile(profile), token };
}

export async function registerMemberProfile(
  input: NewMemberRegistration,
  store = getMemberProfileStore(),
) {
  const name = clean(input.name, 100);
  const email = clean(input.email, 120).toLocaleLowerCase("tr-TR");
  const password = clean(input.password, 120);
  const attendedEventClaim = clean(input.attendedEventClaim, 80);
  const introduction = clean(input.introduction, 500);
  const lookingFor = clean(input.lookingFor, 500);
  const canHelpWith = clean(input.canHelpWith, 500);
  const phone = clean(input.phone, 80);
  const referrer = clean(input.referrer, 120);
  const linkedin = clean(input.linkedin, 240);
  const instagram = clean(input.instagram, 100).replace(/^@/, "");

  if (name.length < 3) throw new Error("Ad ve soyadını yaz");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Geçerli bir e-posta yaz");
  if (!input.consent) throw new Error("KVKK ve topluluk onayı zorunludur");
  if (!allowedEventClaims.has(attendedEventClaim)) throw new Error("Etkinlik bilgisini seç");
  if (attendedEventClaim === "referral" && referrer.length < 3) {
    throw new Error("Seni referans gösteren Notwork üyesini yaz");
  }
  if (introduction.length < 140) throw new Error("Kendini tanıt yanıtı en az 140 karakter olmalı");
  if (lookingFor.length < 140) throw new Error("Ne aradığını en az 140 karakterle anlat");
  if (canHelpWith.length < 140) throw new Error("Neler yapabildiğini en az 140 karakterle anlat");

  const photo = profilePhotoPayload(clean(input.photoDataUrl, 1_000_000));
  const [profiles, sourceMembers] = await Promise.all([
    getRows<StoredMemberProfile>(store, "profiles/"),
    listSourceMembers(),
  ]);
  if (
    profiles.some((profile) => profile.email === email) ||
    sourceMembers.some((member) => clean(member.email, 120).toLocaleLowerCase("tr-TR") === email)
  ) {
    throw new Error("Bu e-posta için profil zaten var. Giriş ekranını kullan.");
  }

  const takenUsernames = new Set([
    ...profiles.map((profile) => profile.username),
    ...sourceMembers.map((member) => clean(member.username, 80).toLocaleLowerCase("tr-TR")),
  ]);
  const baseUsername = registrationUsername(name);
  let username = baseUsername;
  let suffix = 2;
  while (takenUsernames.has(username)) {
    username = `${baseUsername.slice(0, 42)}-${suffix}`;
    suffix += 1;
  }

  const now = new Date().toISOString();
  const memberId = crypto.randomUUID();
  const profileId = crypto.randomUUID();
  const credential = await hashPassword(password);
  const profile: StoredMemberProfile = {
    id: profileId,
    memberId,
    username,
    email,
    phone,
    name,
    headline: introduction.slice(0, 120),
    bio: introduction.slice(0, 320),
    photoUrl: `/api/member-profile?photo=${encodeURIComponent(profileId)}&v=${Date.now()}`,
    skills: [],
    experiences: [],
    links: { linkedin, instagram, website: "" },
    attendedEvents: [],
    eventCodes: [],
    verifiedMember: false,
    publicProfileEnabled: false,
    membershipSource: "profile-application",
    status: "pending",
    credential,
    mustChangePassword: false,
    credentialIssuedAt: now,
    registration: {
      attendedEventClaim,
      introduction,
      lookingFor,
      canHelpWith,
      referrer,
      submittedAt: now,
      reviewedAt: "",
    },
    createdAt: now,
    updatedAt: now,
  };

  await Promise.all([
    store.setJSON(profileKey(username), profile),
    store.setJSON(profileEmailKey(email), { username }),
    store.set(photoKey(profileId), photo.image, { metadata: { contentType: photo.contentType } }),
  ]);

  return { status: "pending" as const, username };
}

export async function activateEventAttendeeMember(
  registration: EventNetworkRegistration,
  store = getMemberProfileStore(),
) {
  const email = clean(
    registration.profile?.emailNormalized || registration.profile?.email,
    120,
  ).toLocaleLowerCase("tr-TR");
  const eventId = clean(
    registration.participant?.eventId || registration.profile?.attendedEvent,
    80,
  );
  const publicCode = clean(registration.participant?.publicCode, 16).toUpperCase();
  const firstName = clean(registration.profile?.firstName, 50);
  const lastName = clean(registration.profile?.lastName, 50);
  const name = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
  const requestedUsername = clean(registration.profile?.username, 80).toLocaleLowerCase("tr-TR");

  if (!email || !eventId || !publicCode || !name || !requestedUsername) {
    throw new Error("Etkinlik üyeliği için kayıt bilgileri eksik");
  }

  const directProfile = (await store.get(profileKey(requestedUsername), {
    type: "json",
    consistency: "strong",
  })) as StoredMemberProfile | null;
  let existing = directProfile?.email === email ? directProfile : null;

  if (!existing) {
    const emailIndex = (await store.get(profileEmailKey(email), {
      type: "json",
      consistency: "strong",
    })) as { username?: string } | null;
    const indexedUsername = clean(emailIndex?.username, 80).toLocaleLowerCase("tr-TR");
    existing = indexedUsername
      ? ((await store.get(profileKey(indexedUsername), {
          type: "json",
          consistency: "strong",
        })) as StoredMemberProfile | null)
      : null;
  }

  let username = existing?.username || requestedUsername;
  if (!existing && directProfile && directProfile.email !== email) {
    username = `${requestedUsername.slice(0, 70)}-${hashToken(email).slice(0, 6)}`;
  }

  const now = new Date().toISOString();
  const intro = clean(registration.intro, 500);
  const needTag = clean(registration.needTag, 40);
  const offers = Array.isArray(registration.offers)
    ? registration.offers
        .map((skill) => clean(skill, 40))
        .filter(Boolean)
        .slice(0, 5)
    : [];
  const eventCode: StoredMemberEventCode = {
    eventId,
    code: publicCode,
    issuedAt: clean(registration.participant?.registeredAt, 40) || now,
  };
  const blocked = existing?.status === "suspended" || existing?.status === "rejected";
  const nextStatus =
    blocked && existing ? existing.status : existing?.credential ? "active" : "invited";
  const profile: StoredMemberProfile = {
    id: existing?.id || crypto.randomUUID(),
    memberId: existing?.memberId || clean(registration.profile?.id, 100) || crypto.randomUUID(),
    username,
    email,
    phone: existing?.phone || "",
    name: existing?.name || name,
    headline:
      existing?.headline || intro.slice(0, 120) || `${needTag || "networking"} · etkinlik üyesi`,
    bio: existing?.bio || intro.slice(0, 320),
    photoUrl: existing?.photoUrl || "",
    skills: existing?.skills?.length ? existing.skills : offers,
    experiences: existing?.experiences || [],
    links: existing?.links || { linkedin: "", instagram: "", website: "" },
    attendedEvents: [...new Set([...(existing?.attendedEvents || []), eventId])],
    eventCodes: [
      ...(existing?.eventCodes || []).filter((eventCodeRow) => eventCodeRow.eventId !== eventId),
      eventCode,
    ].sort((first, second) => second.issuedAt.localeCompare(first.issuedAt)),
    verifiedMember: blocked ? Boolean(existing?.verifiedMember) : true,
    publicProfileEnabled: existing?.publicProfileEnabled ?? false,
    badge: blocked
      ? existing?.badge
      : {
          code: "verified-event-member",
          label: "Doğrulanmış Notwork Üyesi",
          description: "Etkinlik QR kaydı ile doğrulandı.",
        },
    membershipSource: "event-qr",
    autoApprovedEventId: eventId,
    status: nextStatus,
    credential: existing?.credential,
    mustChangePassword: existing?.credential ? existing.mustChangePassword : true,
    registration: existing?.registration
      ? { ...existing.registration, reviewedAt: now }
      : {
          attendedEventClaim: eventId,
          introduction: intro,
          lookingFor: clean(registration.needs, 500),
          canHelpWith: clean(registration.offersDetail || offers.join(", "), 500),
          referrer: "",
          submittedAt: now,
          reviewedAt: now,
        },
    credentialIssuedAt: existing?.credentialIssuedAt || "",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await Promise.all([
    store.setJSON(profileKey(profile.username), profile),
    store.setJSON(profileEmailKey(profile.email), { username: profile.username }),
  ]);

  return {
    username: profile.username,
    status: profile.status,
    verifiedMember: profile.verifiedMember,
    source: "event-qr" as const,
    eventId,
    requiresCredentials: !profile.credential,
  };
}

export async function issueTemporaryCredentials(store = getMemberProfileStore()) {
  const profiles = await getRows<StoredMemberProfile>(store, "profiles/");
  const credentials: TemporaryMemberCredential[] = [];

  for (const profile of profiles) {
    if (profile.status === "suspended" || profile.credential || profile.credentialIssuedAt) {
      continue;
    }
    const temporaryPassword = createTemporaryPassword();
    const credential = await hashPassword(temporaryPassword);
    const updatedAt = new Date().toISOString();
    await store.setJSON(profileKey(profile.username), {
      ...profile,
      credential,
      status: "invited",
      mustChangePassword: true,
      credentialIssuedAt: updatedAt,
      updatedAt,
    } satisfies StoredMemberProfile);
    credentials.push({
      name: profile.name,
      email: profile.email,
      username: profile.username,
      temporaryPassword,
    });
  }

  return credentials.sort((first, second) => first.name.localeCompare(second.name, "tr"));
}

async function revokeMemberSessions(username: string, store = getMemberProfileStore()) {
  const { blobs } = await store.list({ prefix: "sessions/" });
  const sessions = await Promise.all(
    blobs.map(async (blob) => ({
      key: blob.key,
      session: (await store.get(blob.key, {
        type: "json",
        consistency: "strong",
      })) as StoredSession | null,
    })),
  );
  await Promise.all(
    sessions
      .filter(({ session }) => session?.username === username)
      .map(({ key }) => store.delete(key)),
  );
}

export async function resetMemberCredential(
  targetUsername: string,
  store = getMemberProfileStore(),
) {
  const username = clean(targetUsername, 80).toLocaleLowerCase("tr-TR");
  const profile = (await store.get(profileKey(username), {
    type: "json",
    consistency: "strong",
  })) as StoredMemberProfile | null;
  if (!profile) throw new Error("Üye profili bulunamadı");
  if (profile.status === "pending") throw new Error("Önce profil başvurusunu onayla");
  if (profile.status === "rejected" || profile.status === "suspended") {
    throw new Error("Bu profil girişe kapalı");
  }

  const temporaryPassword = createTemporaryPassword();
  const credential = await hashPassword(temporaryPassword);
  const updatedAt = new Date().toISOString();
  await Promise.all([
    store.setJSON(profileKey(profile.username), {
      ...profile,
      credential,
      status: "invited",
      mustChangePassword: true,
      credentialIssuedAt: updatedAt,
      updatedAt,
    } satisfies StoredMemberProfile),
    revokeMemberSessions(profile.username, store),
  ]);

  return {
    name: profile.name,
    email: profile.email,
    username: profile.username,
    temporaryPassword,
  } satisfies TemporaryMemberCredential;
}

export async function importTemporaryCredentials(
  records: ImportedMemberCredential[],
  store = getMemberProfileStore(),
) {
  const profiles = await getRows<StoredMemberProfile>(store, "profiles/");
  const profilesByEmail = new Map(profiles.map((profile) => [profile.email, profile]));
  const profilesByUsername = new Map(profiles.map((profile) => [profile.username, profile]));
  let importedCount = 0;
  let skippedCount = 0;

  for (const record of records.slice(0, 500)) {
    const email = clean(record.email, 120).toLocaleLowerCase("tr-TR");
    const username = clean(record.username, 80).toLocaleLowerCase("tr-TR");
    const credential = record.credential;
    const validCredential =
      credential?.algorithm === "scrypt-v1" &&
      /^[a-f0-9]{32}$/i.test(credential.salt || "") &&
      /^[a-f0-9]{128}$/i.test(credential.hash || "");
    const profile = profilesByEmail.get(email) || profilesByUsername.get(username);

    if (!email || !username || !validCredential || !profile || profile.credential) {
      skippedCount += 1;
      continue;
    }

    const updatedAt = new Date().toISOString();
    await store.setJSON(profileKey(profile.username), {
      ...profile,
      credential,
      status: "invited",
      mustChangePassword: true,
      credentialIssuedAt: updatedAt,
      updatedAt,
    } satisfies StoredMemberProfile);
    importedCount += 1;
  }

  return { importedCount, skippedCount };
}

export async function loginMemberProfile(
  identity: string,
  password: string,
  store = getMemberProfileStore(),
) {
  const normalizedIdentity = clean(identity, 120).toLocaleLowerCase("tr-TR");
  const profiles = await getRows<StoredMemberProfile>(store, "profiles/");
  const matchedProfile = profiles.find(
    (candidate) =>
      candidate.username === normalizedIdentity || candidate.email === normalizedIdentity,
  );
  if (!matchedProfile) return null;
  if (!(await verifyPassword(password, matchedProfile.credential))) return null;
  if (matchedProfile.status === "pending") {
    throw new Error("Profil başvurun admin onayı bekliyor");
  }
  if (matchedProfile.status === "rejected" || matchedProfile.status === "suspended") {
    throw new Error("Profilin şu anda girişe açık değil");
  }
  const profile = await hydrateMemberEventCodes(matchedProfile, store);

  return createMemberSession(profile, store);
}

export async function getMemberProfileBySession(token: string, store = getMemberProfileStore()) {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = (await store.get(sessionKey(tokenHash), {
    type: "json",
    consistency: "strong",
  })) as StoredSession | null;
  if (!session) return null;
  if (Date.parse(session.expiresAt) <= Date.now()) {
    await store.delete(sessionKey(tokenHash));
    return null;
  }
  const storedProfile = (await store.get(profileKey(session.username), {
    type: "json",
    consistency: "strong",
  })) as StoredMemberProfile | null;
  if (!storedProfile || !["active", "invited"].includes(storedProfile.status)) return null;
  const profile = await hydrateMemberEventCodes(storedProfile, store);
  return { profile, tokenHash };
}

export async function getMemberFiveSummary(identifier: string, store = getMemberProfileStore()) {
  const normalizedIdentifier = clean(identifier, 120).toLocaleLowerCase("tr-TR");
  if (!normalizedIdentifier) return null;

  let profile = (await store.get(profileKey(normalizedIdentifier), {
    type: "json",
    consistency: "strong",
  })) as StoredMemberProfile | null;

  if (!profile && normalizedIdentifier.includes("@")) {
    const emailIndex = (await store.get(profileEmailKey(normalizedIdentifier), {
      type: "json",
      consistency: "strong",
    })) as { username?: string } | null;
    const indexedUsername = clean(emailIndex?.username, 80).toLocaleLowerCase("tr-TR");
    profile = indexedUsername
      ? ((await store.get(profileKey(indexedUsername), {
          type: "json",
          consistency: "strong",
        })) as StoredMemberProfile | null)
      : null;
  }

  if (!profile || ["suspended", "rejected"].includes(profile.status)) return null;

  const businessCardEnabled =
    profile.status === "active" && !profile.mustChangePassword && profile.publicProfileEnabled;

  return {
    username: profile.username,
    name: profile.name,
    photoUrl: profile.photoUrl
      ? `/api/member-profile?networkPhoto=${encodeURIComponent(profile.username)}&v=${encodeURIComponent(profile.updatedAt)}`
      : "",
    profileUrl: `/u/${encodeURIComponent(profile.username)}`,
    businessCardEnabled,
  };
}

export async function logoutMemberProfile(token: string, store = getMemberProfileStore()) {
  if (token) await store.delete(sessionKey(hashToken(token)));
}

export async function changeMemberPassword(
  token: string,
  newPassword: string,
  store = getMemberProfileStore(),
) {
  const session = await getMemberProfileBySession(token, store);
  if (!session) return null;
  const credential = await hashPassword(newPassword);
  const updatedAt = new Date().toISOString();
  const profile: StoredMemberProfile = {
    ...session.profile,
    credential,
    mustChangePassword: false,
    status: "active",
    updatedAt,
  };
  await store.setJSON(profileKey(profile.username), profile);
  return publicProfile(profile);
}

type EditableProfileInput = {
  headline?: string;
  bio?: string;
  skills?: unknown;
  experiences?: unknown;
  links?: unknown;
  publicProfileEnabled?: unknown;
  phone?: string;
};

function normalizeSkills(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((skill) => clean(skill, 40))
    .filter(Boolean)
    .slice(0, 5);
}

function normalizeExperiences(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((experience) => {
      const row = experience && typeof experience === "object" ? experience : {};
      return {
        company: clean("company" in row ? row.company : "", 80),
        role: clean("role" in row ? row.role : "", 80),
      };
    })
    .filter((experience) => experience.company || experience.role)
    .slice(0, 3);
}

function normalizeLinks(value: unknown, fallback: StoredMemberProfile["links"]) {
  const links = value && typeof value === "object" ? value : {};
  return {
    linkedin: clean("linkedin" in links ? links.linkedin : fallback.linkedin, 240),
    instagram: clean("instagram" in links ? links.instagram : fallback.instagram, 100).replace(
      /^@/,
      "",
    ),
    website: clean("website" in links ? links.website : fallback.website, 240),
  };
}

export async function updateMemberProfile(
  token: string,
  input: EditableProfileInput,
  store = getMemberProfileStore(),
) {
  const session = await getMemberProfileBySession(token, store);
  if (!session || session.profile.mustChangePassword) return null;
  const updatedAt = new Date().toISOString();
  const profile: StoredMemberProfile = {
    ...session.profile,
    headline: clean(input.headline, 120),
    bio: clean(input.bio, 320),
    skills: normalizeSkills(input.skills),
    experiences: normalizeExperiences(input.experiences),
    links: normalizeLinks(input.links, session.profile.links),
    phone: clean(input.phone, 80),
    publicProfileEnabled: input.publicProfileEnabled === true,
    updatedAt,
  };
  await store.setJSON(profileKey(profile.username), profile);
  return publicProfile(profile);
}

export async function saveMemberProfilePhoto(
  token: string,
  photoDataUrl: string,
  store = getMemberProfileStore(),
) {
  const session = await getMemberProfileBySession(token, store);
  if (!session || session.profile.mustChangePassword) return null;
  const match = photoDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("JPG, PNG veya WebP fotoğraf gerekli");
  const image = Buffer.from(match[2], "base64");
  if (image.byteLength > 700_000) throw new Error("Profil fotoğrafı en fazla 700 KB olabilir");

  const updatedAt = new Date().toISOString();
  await store.set(photoKey(session.profile.id), image, {
    metadata: { contentType: match[1] },
  });
  const profile: StoredMemberProfile = {
    ...session.profile,
    photoUrl: `/api/member-profile?photo=${encodeURIComponent(session.profile.id)}&v=${Date.now()}`,
    updatedAt,
  };
  await store.setJSON(profileKey(profile.username), profile);
  return publicProfile(profile);
}

export async function getMemberProfilePhoto(profileId: string, store = getMemberProfileStore()) {
  const key = photoKey(clean(profileId, 80));
  const blob = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!blob?.data) return null;
  return {
    image: blob.data as ArrayBuffer,
    contentType: String(blob.metadata?.contentType || "image/jpeg"),
  };
}

export async function getNetworkingMemberPhoto(username: string, store = getMemberProfileStore()) {
  const normalizedUsername = clean(username, 80).toLocaleLowerCase("tr-TR");
  if (!normalizedUsername) return null;
  const profile = (await store.get(profileKey(normalizedUsername), {
    type: "json",
    consistency: "strong",
  })) as StoredMemberProfile | null;
  if (!profile || profile.status === "suspended" || !profile.verifiedMember || !profile.photoUrl) {
    return null;
  }
  return getMemberProfilePhoto(profile.id, store);
}

export async function getNetworkingMemberPhotoVersions(store = getMemberProfileStore()) {
  const profiles = await getRows<StoredMemberProfile>(store, "profiles/");
  return new Map(
    profiles
      .filter(
        (profile) =>
          profile.status !== "suspended" && profile.verifiedMember && Boolean(profile.photoUrl),
      )
      .map((profile) => [profile.username, profile.updatedAt]),
  );
}

export async function getPublicMemberProfile(username: string, store = getMemberProfileStore()) {
  const normalizedUsername = clean(username, 80).toLocaleLowerCase("tr-TR");
  if (!normalizedUsername) return null;
  const profile = (await store.get(profileKey(normalizedUsername), {
    type: "json",
    consistency: "strong",
  })) as StoredMemberProfile | null;
  if (
    !profile ||
    profile.status !== "active" ||
    profile.mustChangePassword ||
    !profile.publicProfileEnabled
  ) {
    return null;
  }
  const references = (
    await getRows<StoredMemberReference>(store, `references/${profile.username}/`)
  )
    .filter((reference) => reference.status === "approved")
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .map(publicReference);
  return {
    storedProfile: profile,
    profile: { ...shareableProfile(profile), references },
  };
}

export async function submitMemberReference(
  token: string,
  targetUsername: string,
  skill: string,
  message: string,
  store = getMemberProfileStore(),
) {
  const session = await getMemberProfileBySession(token, store);
  if (
    !session ||
    session.profile.mustChangePassword ||
    session.profile.status !== "active" ||
    !session.profile.verifiedMember
  ) {
    throw new Error("Referans yazmak için doğrulanmış üye girişi gerekli");
  }

  const normalizedTarget = clean(targetUsername, 80).toLocaleLowerCase("tr-TR");
  if (!normalizedTarget || normalizedTarget === session.profile.username) {
    throw new Error("Kendi profiline referans yazamazsın");
  }
  const target = (await store.get(profileKey(normalizedTarget), {
    type: "json",
    consistency: "strong",
  })) as StoredMemberProfile | null;
  if (
    !target ||
    target.status !== "active" ||
    !target.verifiedMember ||
    !target.publicProfileEnabled
  ) {
    throw new Error("Referans verilecek profil yayında değil");
  }

  const cleanSkill = clean(skill, 40);
  const cleanMessage = clean(message, 240);
  if (!cleanSkill) throw new Error("Referans verdiğin yeteneği seç");
  if (cleanMessage.length < 20) throw new Error("Referans mesajı en az 20 karakter olmalı");

  const key = referenceKey(normalizedTarget, session.profile.username);
  const existing = (await store.get(key, {
    type: "json",
    consistency: "strong",
  })) as StoredMemberReference | null;
  const now = new Date().toISOString();
  const reference: StoredMemberReference = {
    id: existing?.id || crypto.randomUUID(),
    targetUsername: normalizedTarget,
    authorUsername: session.profile.username,
    authorName: session.profile.name,
    skill: cleanSkill,
    message: cleanMessage,
    status: "pending",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    reviewedAt: "",
  };
  await store.setJSON(key, reference);
  return reference;
}

export async function moderateMemberReference(
  targetUsername: string,
  authorUsername: string,
  status: "approved" | "rejected",
  store = getMemberProfileStore(),
) {
  const normalizedTarget = clean(targetUsername, 80).toLocaleLowerCase("tr-TR");
  const normalizedAuthor = clean(authorUsername, 80).toLocaleLowerCase("tr-TR");
  const key = referenceKey(normalizedTarget, normalizedAuthor);
  const reference = (await store.get(key, {
    type: "json",
    consistency: "strong",
  })) as StoredMemberReference | null;
  if (!reference) throw new Error("Referans bulunamadı");
  const updatedAt = new Date().toISOString();
  const updated: StoredMemberReference = {
    ...reference,
    status,
    updatedAt,
    reviewedAt: updatedAt,
  };
  await store.setJSON(key, updated);
  return updated;
}

export async function moderateMemberProfile(
  username: string,
  status: "approved" | "rejected",
  store = getMemberProfileStore(),
) {
  const normalizedUsername = clean(username, 80).toLocaleLowerCase("tr-TR");
  const profile = (await store.get(profileKey(normalizedUsername), {
    type: "json",
    consistency: "strong",
  })) as StoredMemberProfile | null;
  if (!profile) throw new Error("Profil başvurusu bulunamadı");
  if (!profile.registration) throw new Error("Bu profil başvuru onayıyla oluşturulmadı");

  const reviewedAt = new Date().toISOString();
  const approved = status === "approved";
  const claimedEvent = clean(profile.registration.attendedEventClaim, 80);
  const attendedEvents =
    approved && claimedEvent !== "referral"
      ? [...new Set([...(profile.attendedEvents || []), claimedEvent])]
      : profile.attendedEvents || [];
  const updated: StoredMemberProfile = {
    ...profile,
    attendedEvents,
    verifiedMember: approved,
    publicProfileEnabled: approved ? profile.publicProfileEnabled : false,
    badge: approved
      ? {
          code: "verified-event-member",
          label: "Doğrulanmış Notwork Üyesi",
          description: "Etkinlik katılımı veya üye referansı admin tarafından doğrulandı.",
        }
      : undefined,
    status: approved ? "active" : "rejected",
    registration: {
      ...profile.registration,
      referrer: clean(profile.registration.referrer, 120),
      reviewedAt,
    },
    updatedAt: reviewedAt,
  };

  await store.setJSON(profileKey(normalizedUsername), updated);

  if (approved) {
    const member: NetworkMemberRow = {
      id: profile.memberId,
      name: profile.name,
      title: profile.registration.introduction.slice(0, 80),
      skills: profile.registration.canHelpWith.slice(0, 240),
      email: profile.email,
      instagram: profile.links.instagram,
      linkedin: profile.links.linkedin,
      motivation: profile.registration.lookingFor.slice(0, 180),
      contact: profile.phone || "",
      createdAt: profile.createdAt,
      username: profile.username,
      consentAt: profile.createdAt,
    };
    const memberStore = getStore({ name: memberStoreName, consistency: "strong" });
    const backupPayload = {
      ...member,
      backupReason: "profile-approved",
      backedUpAt: reviewedAt,
    };
    await Promise.all([
      memberStore.setJSON(`members/${profile.username}.json`, member),
      memberStore.setJSON(`backups/latest/${profile.username}.json`, backupPayload),
      memberStore.setJSON(
        `backups/immutable/${profile.username}/${Date.now()}-${crypto.randomUUID()}-profile-approved.json`,
        backupPayload,
      ),
    ]);
  } else {
    const memberStore = getStore({ name: memberStoreName, consistency: "strong" });
    await Promise.all([
      memberStore.delete(`members/${profile.username}.json`),
      memberStore.delete(`backups/latest/${profile.username}.json`),
    ]);
  }

  return publicProfile(updated);
}

export function safeMemberProfile(profile: StoredMemberProfile) {
  return publicProfile(profile);
}

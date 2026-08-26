import { createHash, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

type PurgeInput = {
  password?: string;
  confirm?: string;
  dryRun?: boolean;
  stores?: string[];
  person?: {
    name?: string;
    username?: string;
    email?: string;
    memberId?: string;
    profileId?: string;
  };
};

type JsonRow = Record<string, unknown>;

const fallbackPasswordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";
const storeNames = [
  "networking-members",
  "networking-members-demo",
  "notwork-member-profiles",
  "notwork-member-profiles-demo",
  "event-network",
  "ntw-five",
  "event-reviews",
  "event-reviews-demo",
  "startup-applications",
];

function validPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(process.env.ADMIN_PASSWORD_HASH || fallbackPasswordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function normalize(value: unknown) {
  return typeof value === "string"
    ? value.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ")
    : "";
}

function decodeKey(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function directIdentityValues(row: JsonRow) {
  return [
    row.name,
    row.username,
    row.email,
    row.id,
    row.memberId,
    row.profileId,
    row.publicCode,
    row.ownerName,
    row.ownerUsername,
    row.ownerEmail,
    row.ownerId,
    row.requesterName,
    row.requesterUsername,
    row.requesterEmail,
    row.requesterId,
    row.targetUsername,
    row.authorUsername,
  ].map(normalize);
}

function recordContainsToken(value: unknown, tokens: Set<string>): boolean {
  if (typeof value === "string") return tokens.has(normalize(value));
  if (Array.isArray(value)) return value.some((item) => recordContainsToken(item, tokens));
  if (!value || typeof value !== "object") return false;
  return Object.values(value as JsonRow).some((item) => recordContainsToken(item, tokens));
}

function collectRelatedTokens(row: JsonRow, tokens: Set<string>) {
  const profile = row.profile && typeof row.profile === "object" ? (row.profile as JsonRow) : null;
  const participant =
    row.participant && typeof row.participant === "object" ? (row.participant as JsonRow) : null;
  const directMatch = directIdentityValues(row).some((value) => value && tokens.has(value));
  const profileMatch = profile
    ? [profile.name, profile.username, profile.email, profile.emailNormalized, profile.id]
        .map(normalize)
        .some((value) => value && tokens.has(value))
    : false;

  if (!directMatch && !profileMatch) return false;

  const candidates = [
    row.id,
    row.memberId,
    row.profileId,
    row.publicCode,
    row.ownerId,
    row.requesterId,
    row.problemId,
    profile?.id,
    profile?.username,
    profile?.email,
    profile?.emailNormalized,
    participant?.id,
    participant?.publicCode,
    participant?.accessTokenHash,
  ];
  let changed = false;
  for (const candidate of candidates) {
    const value = normalize(candidate);
    if (!value || tokens.has(value)) continue;
    tokens.add(value);
    changed = true;
  }
  return changed;
}

async function listAllKeys(store: ReturnType<typeof getStore>) {
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await store.list(cursor ? { cursor } : undefined);
    keys.push(...page.blobs.map((blob) => blob.key));
    cursor = page.cursor;
  } while (cursor);
  return keys;
}

async function readJson(store: ReturnType<typeof getStore>, key: string) {
  try {
    return (await store.get(key, { type: "json", consistency: "strong" })) as JsonRow | null;
  } catch {
    return null;
  }
}

async function purgeStore(storeName: string, initialTokens: Set<string>, dryRun: boolean) {
  const store = getStore({ name: storeName, consistency: "strong" });
  const keys = await listAllKeys(store);
  const rows = new Map<string, JsonRow | null>();
  const tokens = new Set(initialTokens);

  await Promise.all(
    keys.map(async (key) => {
      rows.set(key, await readJson(store, key));
    }),
  );

  for (let pass = 0; pass < 3; pass += 1) {
    let changed = false;
    for (const row of rows.values()) {
      if (row && collectRelatedTokens(row, tokens)) changed = true;
    }
    if (!changed) break;
  }

  const matchedKeys = keys.filter((key) => {
    const normalizedKey = normalize(decodeKey(key));
    const keyMatch = [...tokens].some(
      (token) => token.length >= 8 && normalizedKey.includes(token),
    );
    if (keyMatch) return true;
    const row = rows.get(key);
    return row ? recordContainsToken(row, tokens) : false;
  });

  if (!dryRun) await Promise.all(matchedKeys.map((key) => store.delete(key)));

  return {
    storeName,
    matchedCount: matchedKeys.length,
    deletedCount: dryRun ? 0 : matchedKeys.length,
  };
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const input = (await request.json()) as PurgeInput;
    if (!validPassword(input.password)) return new Response("Yetkisiz erişim", { status: 401 });
    if (input.confirm !== "DELETE PERSON DATA") {
      return new Response("Silme onayı gerekli", { status: 400 });
    }

    const person = input.person || {};
    const tokens = new Set(
      [person.name, person.username, person.email, person.memberId, person.profileId]
        .map(normalize)
        .filter(Boolean),
    );
    if (!tokens.size) return new Response("Kişi kimliği gerekli", { status: 400 });

    const dryRun = input.dryRun !== false;
    const selectedStores = Array.isArray(input.stores)
      ? input.stores.filter((storeName) => storeNames.includes(storeName))
      : [];
    if (selectedStores.length !== 1) {
      return new Response("Tek bir geçerli veri deposu gerekli", { status: 400 });
    }
    const stores = [];
    for (const storeName of selectedStores) {
      stores.push(await purgeStore(storeName, tokens, dryRun));
    }

    const payload = {
      ok: true,
      dryRun,
      identity: {
        name: person.name || "",
        username: person.username || "",
        email: person.email || "",
      },
      matchedCount: stores.reduce((total, store) => total + store.matchedCount, 0),
      deletedCount: stores.reduce((total, store) => total + store.deletedCount, 0),
      stores: stores.map(({ storeName, matchedCount, deletedCount }) => ({
        storeName,
        matchedCount,
        deletedCount,
      })),
    };
    return new Response(JSON.stringify(payload), {
      headers: { "cache-control": "no-store, private", "content-type": "application/json" },
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Kişi verileri temizlenemedi", {
      status: 500,
    });
  }
};

export const config: Config = { path: "/api/admin/privacy-purge" };

import {
  announcementStore,
  subscriptionStatus,
  type SubscriptionStatus,
} from "./_announcements.mjs";
import { createHash, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";
import { getMemberProfileDatabaseInfo, getMemberProfileStore } from "./_member-profile-store.mjs";
import { isTestMemberEmail } from "./_test-members.mjs";

type Row = Record<string, unknown>;
type Contact = {
  email: string;
  names: string[];
  groups: string[];
  sources: string[];
  announcementConsent: SubscriptionStatus;
};
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

async function rows(
  store: ReturnType<typeof getStore>,
  prefix: string,
  include: (key: string) => boolean = () => true,
) {
  const listing = await store.list({ prefix });
  const blobs = listing.blobs.filter(({ key }) => include(key));
  const result: Array<{ key: string; row: Row }> = [];
  // Bound concurrency and retain errors: incomplete exports must not look complete.
  for (let i = 0; i < blobs.length; i += 25) {
    const batch = await Promise.all(
      blobs.slice(i, i + 25).map(async ({ key }) => ({
        key,
        row: (await store.get(key, { type: "json", consistency: "strong" })) as Row | null,
      })),
    );
    for (const item of batch) if (item.row) result.push({ key: item.key, row: item.row });
  }
  return result;
}

export async function collectContacts() {
  const contacts = new Map<string, Contact>();
  let excludedTestRows = 0;
  const add = (emailValue: unknown, nameValue: unknown, source: string, groups: string[] = []) => {
    const email = text(emailValue).toLowerCase();
    if (isTestMemberEmail(email)) {
      excludedTestRows++;
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    const contact = contacts.get(email) || {
      email,
      names: [],
      sources: [],
      groups: [],
      announcementConsent: "unknown" as const,
    };
    contact.names = [...new Set([...contact.names, text(nameValue)].filter(Boolean))];
    contact.sources = [...new Set([...contact.sources, source])];
    contact.groups = [...new Set([...contact.groups, ...groups.filter(Boolean)])];
    contacts.set(email, contact);
  };
  const database = getMemberProfileDatabaseInfo();
  if (database.mode !== "live")
    throw new Error("E-posta dışa aktarımı canlı üye veritabanını gerektirir");
  const specs = [
    { store: "notwork-announcements", prefix: "public-preferences/", source: "Duyuru formu" },
    { store: database.memberSourceStoreName, prefix: "members/", source: "Networking" },
    { store: database.storeName, prefix: "profiles/", source: "Üye profilleri" },
    { store: "startup-applications", prefix: "applications/", source: "Startup başvuruları" },
    { store: "event-network", prefix: "events/", source: "MatchLab" },
    { store: "ntw-five", prefix: "events/", source: "Five" },
  ];
  for (const spec of specs) {
    for (const { key, row } of await rows(
      getStore({ name: spec.store, consistency: "strong" }),
      spec.prefix,
      (key) =>
        spec.prefix !== "events/" ||
        ((/^events\/[^/]+\/live\//.test(key) ||
          key.startsWith("events/21agustoscanli/") ||
          key.startsWith("events/five-live/")) &&
          (spec.source === "MatchLab"
            ? /\/profiles\/[^/]+\.json$/.test(key)
            : /\/problems\/[^/]+\.json$/.test(key))),
    )) {
      if (spec.prefix === "events/") {
        const live =
          /^events\/[^/]+\/live\//.test(key) ||
          key.startsWith("events/21agustoscanli/") ||
          key.startsWith("events/five-live/");
        if (!live) continue;
        if (spec.source === "MatchLab" && /\/profiles\/[^/]+\.json$/.test(key)) {
          const profile = row.profile as Row | undefined;
          if (profile)
            add(
              profile.emailNormalized || profile.email,
              `${text(profile.firstName)} ${text(profile.lastName)}`,
              spec.source,
              [key.split("/")[1]],
            );
        }
        if (spec.source === "Five" && /\/problems\/[^/]+\.json$/.test(key))
          add(row.ownerEmail, row.ownerName, spec.source, [key.split("/")[1]]);
      } else {
        const groups = Array.isArray(row.attendedEvents) ? row.attendedEvents.map(text) : [];
        add(row.email, row.name, spec.source, groups);
      }
    }
  }
  await Promise.all(
    [...contacts.values()].map(async (contact) => {
      contact.announcementConsent = await subscriptionStatus(contact.email);
    }),
  );
  return {
    contacts: [...contacts.values()].sort((a, b) => a.email.localeCompare(b.email)),
    excludedTestRows,
    sources: specs.map((spec) => spec.source),
  };
}

export async function testMembers(remove = false) {
  const database = getMemberProfileDatabaseInfo();
  const stores = [
    getStore({ name: database.memberSourceStoreName, consistency: "strong" }),
    getMemberProfileStore(),
  ];
  const deleted: Array<{ username: string; email: string; source: string }> = [];
  for (const [index, store] of stores.entries()) {
    for (const { key, row } of await rows(store, index === 0 ? "members/" : "profiles/")) {
      if (!isTestMemberEmail(row.email)) continue;
      const username = text(row.username);
      if (!username || !/^[a-z0-9._-]+$/i.test(username)) continue;
      if (remove) {
        await store.setJSON(`test-cleanup-backups/${Date.now()}/${key}`, row);
        await store.delete(key);
        if (index === 1) {
          await store.delete(`profile-emails/${hash(text(row.email))}.json`);
          for (const { key: sessionKey, row: session } of await rows(store, "sessions/"))
            if (session.username === username) await store.delete(sessionKey);
          for (const { key: refKey, row: ref } of await rows(store, "references/"))
            if (ref.authorUsername === username || ref.targetUsername === username)
              await store.delete(refKey);
        }
      }
      deleted.push({
        username,
        email: text(row.email),
        source: index === 0 ? "networking" : "profiles",
      });
    }
  }
  return { members: deleted, removed: remove };
}

export async function deleteContact(email: string) {
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Geçerli e-posta gerekli");
  const database = getMemberProfileDatabaseInfo();
  if (database.mode !== "live") throw new Error("Canlı üye veritabanı gerekli");
  const announcements = announcementStore();
  // Suppress first: a partially failed deletion must never re-enable sending.
  await announcements.setJSON(`suppressions/${hash(email)}.json`, {
    email,
    reason: "admin-removal",
    updatedAt: new Date().toISOString(),
  });
  await announcements.delete(`consents/${hash(email)}.json`);
  await announcements.delete(`public-preferences/${hash(email)}.json`);
  for (const { key } of await rows(announcements, `preferences/${hash(email)}/`))
    await announcements.delete(key);
  for (const { key, row } of await rows(announcements, "tokens/"))
    if (text(row.email).toLowerCase() === email) await announcements.delete(key);
  let removed = 0;
  const usernames = new Set<string>();
  const profileStore = getMemberProfileStore();
  for (const { key, row } of await rows(profileStore, "profiles/")) {
    if (text(row.email).toLowerCase() !== email) continue;
    usernames.add(text(row.username));
    await profileStore.delete(`photos/${text(row.id)}`);
    await profileStore.delete(key);
    removed++;
  }
  await profileStore.delete(`profile-emails/${hash(email)}.json`);
  const memberStore = getStore({ name: database.memberSourceStoreName, consistency: "strong" });
  for (const { key, row } of await rows(memberStore, "members/")) {
    if (text(row.email).toLowerCase() !== email) continue;
    usernames.add(text(row.username));
    await memberStore.delete(key);
    removed++;
  }
  usernames.delete("");
  for (const prefix of ["sessions/", "references/"]) {
    for (const { key, row } of await rows(profileStore, prefix)) {
      if (
        [row.username, row.authorUsername, row.targetUsername].some((value) =>
          usernames.has(text(value)),
        )
      )
        await profileStore.delete(key);
    }
  }
  return {
    email,
    removed,
    announcementConsent: await subscriptionStatus(email),
    remainingSources:
      (await collectContacts()).contacts.find((contact) => contact.email === email)?.sources || [],
  };
}

export default async (request: Request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const input = (await request.json()) as { password?: string; action?: string; email?: string };
    const expected = Buffer.from(
      process.env.ADMIN_PASSWORD_HASH ||
        "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee",
    );
    const actual = Buffer.from(hash(input.password || ""));
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return new Response("Yetkisiz erişim", { status: 401 });
    if (
      input.action &&
      !["export", "testMembers", "deleteTestMembers", "deleteContact"].includes(input.action)
    )
      return new Response("Geçersiz işlem", { status: 400 });
    const result =
      input.action === "deleteContact"
        ? await deleteContact(input.email || "")
        : input.action === "testMembers" || input.action === "deleteTestMembers"
          ? await testMembers(input.action === "deleteTestMembers")
          : await collectContacts();
    return Response.json(result, { headers: { "cache-control": "no-store, private" } });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "İşlem tamamlanamadı", {
      status: 500,
    });
  }
};
export const config: Config = { path: "/api/admin/contacts" };

import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";
import seedMembers from "../data/networking-seed.json" with { type: "json" };

type MemberRow = {
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

type MemberInput = {
  id?: string;
  name?: string;
  title?: string;
  skills?: string[] | string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  motivation?: string;
  contact?: string;
  createdAt?: number | string;
  username?: string;
  consentAt?: string;
};

type ChangeRequest = {
  id: string;
  username: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  current: MemberRow;
  proposed: MemberRow;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

function serializeSkills(value: MemberInput["skills"]) {
  if (Array.isArray(value))
    return value
      .map((skill) => clean(skill, 40))
      .filter(Boolean)
      .join(", ");
  return clean(value, 240);
}

function normalizeMember(input: MemberInput, fallback?: Partial<MemberRow>): MemberRow {
  const createdAt =
    typeof input.createdAt === "number"
      ? new Date(input.createdAt).toISOString()
      : clean(input.createdAt, 40) || fallback?.createdAt || new Date().toISOString();
  return {
    id: clean(input.id, 80) || fallback?.id || crypto.randomUUID(),
    name: clean(input.name, 80) || fallback?.name || "",
    title: clean(input.title, 80) || fallback?.title || "",
    skills: serializeSkills(input.skills) || fallback?.skills || "",
    email: clean(input.email, 120) || fallback?.email || "",
    instagram: clean(input.instagram, 80).replace(/^@/, "") || fallback?.instagram || "",
    linkedin: clean(input.linkedin, 200) || fallback?.linkedin || "",
    motivation: clean(input.motivation, 180) || fallback?.motivation || "",
    contact: clean(input.contact, 240) || fallback?.contact || "",
    createdAt,
    username: clean(input.username, 80).toLowerCase() || fallback?.username || "",
    consentAt: clean(input.consentAt, 40) || fallback?.consentAt || "",
  };
}

function memberKey(member: Pick<MemberRow, "id" | "username">) {
  return `members/${member.username || member.id}.json`;
}

function backupKey(member: Pick<MemberRow, "id" | "username">) {
  return `backups/latest/${member.username || member.id}.json`;
}

function immutableBackupKey(member: Pick<MemberRow, "id" | "username">, reason: string) {
  const safeReason = reason.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  return `backups/immutable/${member.username || member.id}/${Date.now()}-${crypto.randomUUID()}-${safeReason}.json`;
}

async function backupMember(
  store: ReturnType<typeof getStore>,
  member: MemberRow,
  reason: "seed" | "create" | "update" | "reconcile" | "delete" | "admin-update",
) {
  const immutableKey = immutableBackupKey(member, reason);
  const payload = {
    ...member,
    backupReason: reason,
    backedUpAt: new Date().toISOString(),
  };
  await Promise.all([
    store.setJSON(backupKey(member), payload),
    store.setJSON(immutableKey, payload),
  ]);
}

async function backupMembers(
  store: ReturnType<typeof getStore>,
  members: MemberRow[],
  reason: "seed" | "create" | "update" | "reconcile",
) {
  await Promise.all(members.map((member) => backupMember(store, member, reason)));
}

function changeRequestKey(request: Pick<ChangeRequest, "id">) {
  return `change-requests/pending/${request.id}.json`;
}

async function ensureSeeded(store: ReturnType<typeof getStore>) {
  const seeded = await store.get("meta/seeded-v1", { consistency: "strong" });
  if (seeded) return;

  const members = (seedMembers as MemberRow[])
    .map((member) => normalizeMember(member))
    .filter((member) => member.name && member.title && member.username);
  await Promise.all(members.map((member) => store.setJSON(memberKey(member), member)));
  await backupMembers(store, members, "seed");
  await store.set("meta/seeded-v1", new Date().toISOString());
}

async function getBlobRows(store: ReturnType<typeof getStore>) {
  await ensureSeeded(store);
  const { blobs } = await store.list({ prefix: "members/" });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );
  return rows.filter(Boolean) as MemberRow[];
}

async function getRows(store: ReturnType<typeof getStore>) {
  const rows = await getBlobRows(store);
  const merged = new Map<string, MemberRow>();
  for (const row of rows) {
    const key = String(row.username || row.id || "").toLowerCase();
    if (key) merged.set(key, row);
  }
  return [...merged.values()];
}

async function ensureBackedUp(store: ReturnType<typeof getStore>) {
  const backedUp = await store.get("meta/backed-up-v1", { consistency: "strong" });
  if (backedUp) return;
  const rows = await getRows(store);
  await backupMembers(store, rows, "reconcile");
  await store.set("meta/backed-up-v1", new Date().toISOString());
}

export default async (request: Request, _context: Context) => {
  const store = getStore({ name: "networking-members", consistency: "strong" });

  if (request.method === "GET") {
    await ensureBackedUp(store);
    return Response.json(await getRows(store), { headers: { "cache-control": "no-store" } });
  }

  if (request.method === "POST") {
    const input = (await request.json()) as MemberInput;
    const member = normalizeMember(input);
    if (!member.name || !member.title || !member.email || !member.username) {
      return new Response("Eksik kayıt bilgisi", { status: 400 });
    }

    await ensureSeeded(store);
    await Promise.all([
      store.setJSON(memberKey(member), member),
      backupMember(store, member, "create"),
    ]);
    return Response.json({ ok: true }, { status: 201 });
  }

  if (request.method === "PATCH") {
    const input = (await request.json()) as MemberInput;
    const username = clean(input.username, 80).toLowerCase();
    if (!username) return new Response("Kullanıcı adı gerekli", { status: 400 });

    const existing = (await getRows(store)).find((row) => row.username === username);
    if (!existing) return new Response("Kayıt bulunamadı", { status: 404 });

    const member = normalizeMember({ ...input, username }, existing);
    const changeRequest: ChangeRequest = {
      id: crypto.randomUUID(),
      username,
      requestedAt: new Date().toISOString(),
      status: "pending",
      current: existing,
      proposed: member,
    };
    await store.setJSON(changeRequestKey(changeRequest), changeRequest);
    return Response.json({ ok: true, pendingApproval: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: "/api/networking/members" };

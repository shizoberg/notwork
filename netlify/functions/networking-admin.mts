import { createHash, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

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

type MemberInput = Partial<MemberRow> & {
  skills?: string[] | string;
};

type ChangeRequest = {
  id: string;
  username: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  current: MemberRow;
  proposed: MemberRow;
  resolvedAt?: string;
};

type AdminInput = {
  password?: string;
  action?: "list" | "create" | "update" | "delete" | "approve" | "reject";
  member?: MemberInput;
  username?: string;
  requestId?: string;
};

const passwordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";

function validPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(passwordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

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
    createdAt: clean(input.createdAt, 40) || fallback?.createdAt || new Date().toISOString(),
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
  return `backups/immutable/${member.username || member.id}/${Date.now()}-${crypto.randomUUID()}-${reason}.json`;
}

async function backupMember(
  store: ReturnType<typeof getStore>,
  member: MemberRow,
  reason: "create" | "update" | "delete" | "admin-update",
) {
  const payload = { ...member, backupReason: reason, backedUpAt: new Date().toISOString() };
  await Promise.all([
    store.setJSON(backupKey(member), payload),
    store.setJSON(immutableBackupKey(member, reason), payload),
  ]);
}

async function getJsonRows<T>(store: ReturnType<typeof getStore>, prefix: string) {
  const { blobs } = await store.list({ prefix });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );
  return rows.filter(Boolean) as T[];
}

async function getMembers(store: ReturnType<typeof getStore>) {
  const rows = await getJsonRows<MemberRow>(store, "members/");
  return rows.sort((first, second) => first.name.localeCompare(second.name, "tr"));
}

async function getRequests(store: ReturnType<typeof getStore>) {
  const rows = await getJsonRows<ChangeRequest>(store, "change-requests/pending/");
  return rows.sort((first, second) => second.requestedAt.localeCompare(first.requestedAt));
}

async function moveRequest(
  store: ReturnType<typeof getStore>,
  request: ChangeRequest,
  status: "approved" | "rejected",
) {
  const resolved = { ...request, status, resolvedAt: new Date().toISOString() };
  await Promise.all([
    store.setJSON(`change-requests/resolved/${status}/${request.id}.json`, resolved),
    store.delete(`change-requests/pending/${request.id}.json`),
  ]);
}

async function jsonResponse(store: ReturnType<typeof getStore>) {
  return Response.json(
    { members: await getMembers(store), requests: await getRequests(store) },
    { headers: { "cache-control": "no-store, private" } },
  );
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const input = (await request.json()) as AdminInput;
  if (!validPassword(input.password)) return new Response("Yetkisiz erişim", { status: 401 });

  const store = getStore({ name: "networking-members", consistency: "strong" });
  const action = input.action || "list";

  if (action === "list") return jsonResponse(store);

  if (action === "create") {
    const member = normalizeMember(input.member || {});
    if (!member.name || !member.title || !member.email || !member.username) {
      return new Response("Eksik üye bilgisi", { status: 400 });
    }
    const existing = await store.get(memberKey(member), { consistency: "strong" });
    if (existing) return new Response("Bu kullanıcı adı zaten var", { status: 409 });
    await Promise.all([
      store.setJSON(memberKey(member), member),
      backupMember(store, member, "create"),
    ]);
    return jsonResponse(store);
  }

  if (action === "update") {
    const username = clean(input.username || input.member?.username, 80).toLowerCase();
    if (!username) return new Response("Kullanıcı adı gerekli", { status: 400 });
    const current = await store.get(memberKey({ username, id: "" }), {
      type: "json",
      consistency: "strong",
    });
    if (!current) return new Response("Üye bulunamadı", { status: 404 });
    const member = normalizeMember({ ...input.member, username }, current as MemberRow);
    await Promise.all([
      store.setJSON(memberKey(member), member),
      backupMember(store, member, "admin-update"),
    ]);
    return jsonResponse(store);
  }

  if (action === "delete") {
    const username = clean(input.username, 80).toLowerCase();
    if (!username) return new Response("Kullanıcı adı gerekli", { status: 400 });
    const current = await store.get(memberKey({ username, id: "" }), {
      type: "json",
      consistency: "strong",
    });
    if (current) await backupMember(store, current as MemberRow, "delete");
    await store.delete(memberKey({ username, id: "" }));
    return jsonResponse(store);
  }

  if (action === "approve" || action === "reject") {
    const requestId = clean(input.requestId, 80);
    const changeRequest = await store.get(`change-requests/pending/${requestId}.json`, {
      type: "json",
      consistency: "strong",
    });
    if (!changeRequest) return new Response("Talep bulunamadı", { status: 404 });
    const typedRequest = changeRequest as ChangeRequest;
    if (action === "approve") {
      await Promise.all([
        store.setJSON(memberKey(typedRequest.proposed), typedRequest.proposed),
        backupMember(store, typedRequest.proposed, "update"),
      ]);
    }
    await moveRequest(store, typedRequest, action === "approve" ? "approved" : "rejected");
    return jsonResponse(store);
  }

  return new Response("Geçersiz işlem", { status: 400 });
};

export const config: Config = { path: "/api/networking/admin" };

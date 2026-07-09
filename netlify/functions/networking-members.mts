import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

const SHEETDB_API_URL = "https://sheetdb.io/api/v1/lvy078ioydj26";
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1DMXhbpGt-8gWviTlcc2uGa8vpWoJQwFdPuWkZCNV05s/gviz/tq?tqx=out:csv";

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
  };
}

function parseCsv(csv: string): Record<string, string>[] {
  const records: string[][] = [];
  let record: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      record.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
      record.push(value);
      if (record.some(Boolean)) records.push(record);
      record = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (value || record.length > 0) {
    record.push(value);
    if (record.some(Boolean)) records.push(record);
  }

  const [headers = [], ...rows] = records;
  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), row[index] || ""])),
  );
}

async function fetchSheetRows() {
  try {
    const response = await fetch(SHEETDB_API_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) return (await response.json()) as MemberRow[];
  } catch {
    // Fall through to the public CSV fallback.
  }

  const response = await fetch(GOOGLE_SHEET_CSV_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return [];
  return parseCsv(await response.text()) as MemberRow[];
}

async function sheetWrite(method: "POST" | "PATCH", member: MemberRow, username?: string) {
  const url =
    method === "PATCH"
      ? `${SHEETDB_API_URL}/username/${encodeURIComponent(username || member.username)}`
      : SHEETDB_API_URL;
  const body =
    method === "PATCH"
      ? { data: { ...member, id: undefined, createdAt: undefined, username: undefined } }
      : { data: [member] };
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  return response.ok;
}

function memberKey(member: Pick<MemberRow, "id" | "username">) {
  return `members/${member.username || member.id}.json`;
}

async function getBlobRows() {
  const store = getStore({ name: "networking-members", consistency: "strong" });
  const { blobs } = await store.list({ prefix: "members/" });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );
  return rows.filter(Boolean) as MemberRow[];
}

async function getMergedRows() {
  const rows = [...(await fetchSheetRows()), ...(await getBlobRows())];
  const merged = new Map<string, MemberRow>();
  for (const row of rows) {
    const key = String(row.username || row.id || "").toLowerCase();
    if (key) merged.set(key, row);
  }
  return [...merged.values()];
}

export default async (request: Request, _context: Context) => {
  const store = getStore({ name: "networking-members", consistency: "strong" });

  if (request.method === "GET") {
    return Response.json(await getMergedRows(), { headers: { "cache-control": "no-store" } });
  }

  if (request.method === "POST") {
    const input = (await request.json()) as MemberInput;
    const member = normalizeMember(input);
    if (!member.name || !member.title || !member.email || !member.username) {
      return new Response("Eksik kayıt bilgisi", { status: 400 });
    }

    const savedToSheet = await sheetWrite("POST", member).catch(() => false);
    if (!savedToSheet) await store.setJSON(memberKey(member), member);
    return Response.json(
      { ok: true, fallback: !savedToSheet },
      { status: savedToSheet ? 201 : 202 },
    );
  }

  if (request.method === "PATCH") {
    const input = (await request.json()) as MemberInput;
    const username = clean(input.username, 80).toLowerCase();
    if (!username) return new Response("Kullanıcı adı gerekli", { status: 400 });

    const existing = (await getMergedRows()).find((row) => row.username === username);
    if (!existing) return new Response("Kayıt bulunamadı", { status: 404 });

    const member = normalizeMember({ ...input, username }, existing);
    const savedToSheet = await sheetWrite("PATCH", member, username).catch(() => false);
    if (!savedToSheet) await store.setJSON(memberKey(member), member);
    return Response.json({ ok: true, fallback: !savedToSheet });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: "/api/networking/members" };

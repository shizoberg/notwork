import { createServerFn } from "@tanstack/react-start";

export type Member = {
  id: string;
  name: string;
  title: string;
  skills: string[];
  email?: string;
  instagram?: string;
  linkedin?: string;
  motivation?: string;
  contact?: string;
  createdAt: number;
};

const API_URL = "https://sheetdb.io/api/v1/lvy078ioydj26";
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1DMXhbpGt-8gWviTlcc2uGa8vpWoJQwFdPuWkZCNV05s/gviz/tq?tqx=out:csv";

type SheetRow = Record<string, string>;

function parseCsv(csv: string): SheetRow[] {
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

const fetchMemberRows = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      const rows = (await response.json()) as SheetRow[];
      if (rows.length > 0) return rows;
    }
  } catch (error) {
    void error;
  }

  const response = await fetch(GOOGLE_SHEET_CSV_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Networking kayıtları alınamadı");
  return parseCsv(await response.text());
});

export async function listMembers(): Promise<Member[]> {
  const rows = await fetchMemberRows();
  return rows
    .map((row, index) => ({
      id: row.id?.trim() || `sheet-row-${index}`,
      name: row.name?.trim() || "",
      title: row.title?.trim() || "",
      skills: parseSkills(row.skills || ""),
      email: row.email?.trim() || undefined,
      instagram: row.instagram?.trim().replace(/^@/, "") || undefined,
      linkedin: row.linkedin?.trim() || undefined,
      motivation: row.motivation?.trim() || undefined,
      contact: row.contact?.trim() || undefined,
      createdAt: Date.parse(row.createdAt || "") || 0,
    }))
    .filter((member) => member.name && member.title)
    .reverse();
}

export async function addMember(input: Omit<Member, "id" | "createdAt">): Promise<Member> {
  const member: Member = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [
        {
          id: member.id,
          name: member.name,
          title: member.title,
          skills: member.skills.join(", "),
          email: member.email || "",
          instagram: member.instagram || "",
          linkedin: member.linkedin || "",
          motivation: member.motivation || "",
          contact: "",
          createdAt: new Date(member.createdAt).toISOString(),
        },
      ],
    }),
  });
  if (!response.ok) throw new Error("Networking kaydı eklenemedi");
  return member;
}

export function parseSkills(raw: string): string[] {
  return raw
    .split(/[,;\n]/g)
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

export type Member = {
  id: string;
  name: string;
  title: string;
  skills: string[];
  contact?: string;
  createdAt: number;
};

const API_URL = "https://sheetdb.io/api/v1/lvy078ioydj26";

type SheetRow = Record<string, string>;

export async function listMembers(): Promise<Member[]> {
  const response = await fetch(API_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("Networking kayıtları alınamadı");
  const rows = (await response.json()) as SheetRow[];
  return rows
    .map((row, index) => ({
      id: row.id?.trim() || `sheet-row-${index}`,
      name: row.name?.trim() || "",
      title: row.title?.trim() || "",
      skills: parseSkills(row.skills || ""),
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
          contact: member.contact || "",
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

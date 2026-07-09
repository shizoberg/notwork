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
  username: string;
  createdAt: number;
};

const API_URL = "/api/networking/members";

type SheetRow = Record<string, string | number | undefined>;

export async function listMembers(): Promise<Member[]> {
  const response = await fetch(API_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("Networking kayıtları alınamadı");
  const rows = (await response.json()) as SheetRow[];
  return rows
    .map((row, index) => ({
      id: String(row.id || "").trim() || `sheet-row-${index}`,
      name: String(row.name || "").trim(),
      title: String(row.title || "").trim(),
      skills: parseSkills(String(row.skills || "")),
      email: String(row.email || "").trim() || undefined,
      instagram:
        String(row.instagram || "")
          .trim()
          .replace(/^@/, "") || undefined,
      linkedin: String(row.linkedin || "").trim() || undefined,
      motivation: String(row.motivation || "").trim() || undefined,
      contact: String(row.contact || "").trim() || undefined,
      username: String(row.username || "")
        .trim()
        .toLowerCase(),
      createdAt: Date.parse(String(row.createdAt || "")) || 0,
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
    body: JSON.stringify(member),
  });
  if (!response.ok) throw new Error("Networking kaydı eklenemedi");
  return member;
}

export async function updateMember(
  username: string,
  input: Omit<Member, "id" | "username" | "createdAt">,
): Promise<void> {
  const response = await fetch(API_URL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      ...input,
    }),
  });
  if (!response.ok) throw new Error("Networking kaydı güncellenemedi");
}

export function createUsername(name: string, existingUsernames: string[]): string {
  const base =
    name
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 28) || "notworker";
  const used = new Set(existingUsernames.map((username) => username.toLowerCase()));
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}${suffix}`)) suffix += 1;
  return `${base}${suffix}`;
}

export function parseSkills(raw: string): string[] {
  return raw
    .split(/[,;\n]/g)
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

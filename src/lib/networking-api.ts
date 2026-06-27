export type Member = {
  id: string;
  name: string;
  title: string;
  skills: string[];
  contact?: string;
  createdAt: number;
};

const STORAGE_KEY = "notwork.networking.members.v1";

export async function listMembers(): Promise<Member[]> {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Member[]) : seed;
  } catch {
    return seed;
  }
}

export async function addMember(input: Omit<Member, "id" | "createdAt">): Promise<Member> {
  const member: Member = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  if (typeof window !== "undefined") {
    const current = await listMembers();
    const next = [member, ...current.filter((item) => item.id !== member.id)];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return member;
}

export function parseSkills(raw: string): string[] {
  return raw
    .split(/[,;\n]/g)
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

const seed: Member[] = [
  {
    id: "s1",
    name: "Berk",
    title: "yazılımcı",
    skills: ["react", "typescript", "ui"],
    createdAt: 0,
  },
  {
    id: "s2",
    name: "Ahmet",
    title: "pazarlamacı",
    skills: ["pazarlama", "marka", "ui"],
    createdAt: 0,
  },
  {
    id: "s3",
    name: "Zeynep",
    title: "tasarımcı",
    skills: ["ui", "figma", "marka"],
    createdAt: 0,
  },
  {
    id: "s4",
    name: "Deniz",
    title: "girişimci",
    skills: ["satış", "pazarlama"],
    createdAt: 0,
  },
];

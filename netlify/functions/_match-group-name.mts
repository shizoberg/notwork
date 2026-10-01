import { createHash } from "node:crypto";

// Names are short enough to identify a group aloud in a busy room.
const names = [
  "Panda", "Kaplan", "Aslan", "Pars", "Panter", "Jaguar", "Vaşak", "Kartal",
  "Şahin", "Atmaca", "Turna", "Leylek", "Baykuş", "Anka", "Kuzgun", "Sincap",
  "Zürafa", "Zebra", "Ceylan", "Geyik", "Karaca", "Tilki", "Kurt", "Ayı",
  "Koala", "Lemur", "Samur", "Yunus", "Balina", "Orka", "Fok", "Penguen",
  "Flamingo", "Pelikan", "Tukan", "Albatros", "Martı", "Kırlangıç", "Serçe", "Arı",
  "Kelebek", "Tavus", "Tavşan", "Kirpi", "Kunduz", "Kanguru", "Fil", "Goril",
  "Koç", "Boğa", "İkizler", "Yengeç", "Başak", "Terazi", "Akrep", "Yay",
  "Oğlak", "Kova", "Balık", "Mors", "Puma", "Karınca", "Çita", "Anakonda",
  "Kobra", "Akbaba", "Güvercin", "Karabatak", "Sülün", "Bıldırcın", "Ahtapot", "Denizatı",
] as const;

export function matchGroupName(groupId: string, occupied: Iterable<string> = []) {
  const used = new Set(occupied);
  const start = createHash("sha256").update(groupId).digest().readUInt32BE(0) % names.length;
  for (let offset = 0; offset < names.length; offset++) {
    const name = names[(start + offset) % names.length];
    if (!used.has(name)) return name;
  }
  // A rare large event can exceed the name pool while preserving a single word.
  for (let suffix = 2; ; suffix++) {
    const name = `${names[start]}${suffix}`;
    if (!used.has(name)) return name;
  }
}

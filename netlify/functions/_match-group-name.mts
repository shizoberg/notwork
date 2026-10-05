import { createHash } from "node:crypto";

const names = [
  "İş bitiriciler", "Hızlı aksiyon alanlar", "Risk severler", "Hayalperestler",
  "Büyük düşünenler", "Oyun kurucular", "Fırsat avcıları", "Ezber bozanlar",
  "Rota çizenler", "Fikir avcıları", "Gelecek kurucuları", "İlk hamleciler",
  "Çözümcüler", "Fırsatçılar", "Vizyonerler", "Meraklılar", "Üreticiler",
  "Keşifçiler", "Cesurlar", "Bağlantıcılar", "Yaratıcılar", "Öncüler",
  "Kurucular", "Yenilikçiler", "Maceracılar", "Büyük oyuncular",
  "Kervanı yolda dizenler", "Bir yolunu bulanlar", "Aklına koyanlar",
  "Taşın altına elini koyanlar", "Kendi yolunu açanlar", "Fırsatı koklayanlar",
  "Oyunu değiştirenler", "Fikri büyütenler", "Sınır zorlayanlar",
  "İşi sahiplenenler", "Sahaya çıkanlar", "Harekete hazırlar",
  "Yeni yol açanlar", "Kapı açanlar", "Fikrin peşindekiler",
  "Şansını yaratanlar", "Geleceği düşünenler", "Farklı düşünenler",
  "Büyük hayalciler", "Cesur kafalar", "Hızlı düşünenler",
  "Birlikte üretenler", "Gerçek notworkler", "Kaybedenler kulübü",
] as const;

export function matchGroupName(groupId: string, occupied: Iterable<string> = []) {
  const used = new Set(occupied);
  const start = createHash("sha256").update(groupId).digest().readUInt32BE(0) % names.length;
  for (let offset = 0; offset < names.length; offset++) {
    const name = names[(start + offset) % names.length];
    if (!used.has(name)) return name;
  }
  // A large event can exceed the name pool; keep names unique.
  for (let suffix = 2; ; suffix++) {
    const name = `${names[start]} ${suffix}`;
    if (!used.has(name)) return name;
  }
}

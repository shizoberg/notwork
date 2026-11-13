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

const launchNames = [
  "Fox", "Bear", "Panda", "Tiger", "Lion", "Wolf", "Owl", "Eagle", "Hawk", "Falcon",
  "Otter", "Rabbit", "Deer", "Moose", "Koala", "Seal", "Whale", "Dolphin", "Orca",
  "Raven", "Robin", "Swan", "Heron", "Crane", "Finch", "Sparrow", "Penguin", "Turtle",
  "Shark", "Ray", "Crab", "Gecko", "Frog", "Lynx", "Bison", "Zebra", "Horse", "Goat",
  "Llama", "Alpaca", "Badger", "Mole", "Beaver", "Hedgehog", "Ferret", "Sable", "Mink",
  "Toucan", "Parrot", "Puffin", "Kiwi", "Peacock", "Dove", "Magpie", "Lark",
  "Sun", "Moon", "Star", "Cloud", "Rain", "Snow", "Wind", "Fire", "River", "Lake",
  "Ocean", "Stone", "Sand", "Leaf", "Oak", "Pine", "Birch", "Coral", "Pearl",
] as const;

export function isLaunchGroupName(name?: string) {
  return launchNames.some((candidate) => name === candidate || name?.startsWith(candidate + " "));
}

export function matchGroupName(groupId: string, occupied: Iterable<string> = [], launch = false) {
  const pool = launch ? launchNames : names;
  const used = new Set(occupied);
  const start = createHash("sha256").update(groupId).digest().readUInt32BE(0) % pool.length;
  for (let offset = 0; offset < pool.length; offset++) {
    const name = pool[(start + offset) % pool.length];
    if (!used.has(name)) return name;
  }
  // A large event can exceed the name pool; keep names unique.
  for (let suffix = 2; ; suffix++) {
    const name = `${pool[start]} ${suffix}`;
    if (!used.has(name)) return name;
  }
}

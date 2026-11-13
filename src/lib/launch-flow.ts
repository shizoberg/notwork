export const launchQuestionKeys = ["intro", "offersDetail", "needs"] as const;
export type LaunchApp = "match" | "poll";
export type LaunchFlow = {
  revision: number;
  organizerName: string;
  logo: string;
  cover: string;
  welcomeTitle: string;
  welcomeText: string;
  registerLabel: string;
  loginLabel: string;
  nextLabel: string;
  finishLabel: string;
  categoryLabel: string;
  matchLabel: string;
  votesLabel: string;
  voteReminder: string;
  routeLabel: string;
  showSelfie: boolean;
  categories: string[];
  schedule: { time: string; label: string }[];
  apps: LaunchApp[];
  questions: { title: string; label: string; placeholder: string; options: string[] }[];
};

export const defaultLaunchFlow: LaunchFlow = {
  revision: 0,
  organizerName: "launchspace",
  logo: "/launchspace/logo.jpg",
  cover: "/launchspace/cover.jpg",
  welcomeTitle: "Etkinliğe katıl",
  welcomeText: "Yeni insanlarla tanış, firma sunumlarını izle ve favori sunumuna oy ver.",
  registerLabel: "Etkinliğe kayıt ol",
  loginLabel: "Profilim var · giriş yap",
  nextLabel: "Devam et",
  finishLabel: "Kaydı tamamla",
  categoryLabel: "Katkı alanın",
  matchLabel: "Nodes Match",
  votesLabel: "Nodes Votes",
  voteReminder: "Lütfen oyunu tüm sunumlar bittikten sonra kullan.",
  routeLabel: "Tanışma rotan",
  showSelfie: true,
  categories: [
    "networking",
    "teknoloji",
    "tasarım",
    "pazarlama",
    "girişimcilik",
    "içerik",
    "araştırma",
  ],
  schedule: [
    { time: "18:00", label: "Giriş ve networking" },
    { time: "19:00", label: "Sunumlar" },
    { time: "20:00", label: "Networking · 22.00’ye kadar" },
  ],
  apps: ["match", "poll"],
  questions: [
    {
      title: "Biraz senden bahsedelim.",
      label: "Kendini nasıl tanıtırsın?",
      placeholder: "Neyle uğraşıyorsun, seni ne heyecanlandırıyor?",
      options: [],
    },
    {
      title: "Paylaştıkça çoğalır.",
      label: "İnsanlara ne katabilirsin?",
      placeholder: "Deneyimin, bildiklerin, birlikte yapabileceklerin…",
      options: [],
    },
    {
      title: "Yeni ihtimallere açıl.",
      label: "Bu buluşmada ne arıyorsun?",
      placeholder: "Tanışmak istediğin insanlar ve aradığın destek…",
      options: [],
    },
  ],
};

export const launchImageLimit = 2_000_000;
export const launchAssetPattern = /^[a-f0-9-]{36}\.(?:jpg|png|webp)$/;

export function validateLaunchFlow(value: LaunchFlow): LaunchFlow {
  function line(value: unknown, limit: number, optional = false) {
    if (typeof value !== "string" || value.trim().length > limit || (!optional && !value.trim()))
      throw Error("Zorunlu alanları doldur ve metin sınırlarını kontrol et.");
    return value.trim();
  }
  function options(values: unknown, required: boolean) {
    if (!Array.isArray(values) || values.length > 12 || (required && !values.length))
      throw Error("Seçenek listesinde en fazla 12 cevap olabilir. Katkı alanı boş bırakılamaz.");
    const cleaned = values.map((v) => line(v, 40));
    if (new Set(cleaned.map((v) => v.toLocaleLowerCase("tr-TR"))).size !== cleaned.length)
      throw Error("Aynı cevap seçeneğini birden fazla kez ekleme.");
    return cleaned;
  }
  if (
    !Number.isSafeInteger(value.revision) ||
    value.revision < 0 ||
    !Array.isArray(value.questions) ||
    value.questions.length !== 3 ||
    !Array.isArray(value.schedule) ||
    !value.schedule.length ||
    value.schedule.length > 12 ||
    !Array.isArray(value.apps) ||
    value.apps.length !== 2 ||
    !value.apps.includes("match") ||
    !value.apps.includes("poll")
  )
    throw Error("Akış, soru veya uygulama sırası geçersiz.");
  function image(path: string | undefined, key: "logo" | "cover") {
    const fallback = defaultLaunchFlow[key];
    if (!path || path === fallback) return fallback;
    const prefix = "/api/launch-admin?asset=";
    if (!path.startsWith(prefix) || !launchAssetPattern.test(path.slice(prefix.length)))
      throw Error("Geçersiz görsel. Dosyayı yeniden yükle.");
    return path;
  }
  return {
    revision: value.revision,
    organizerName: line(value.organizerName ?? defaultLaunchFlow.organizerName, 60).replace(
      /launch\s+space/gi,
      "launchspace",
    ),
    logo: image(value.logo, "logo"),
    cover: image(value.cover, "cover"),
    welcomeTitle: line(value.welcomeTitle, 100),
    welcomeText: line(value.welcomeText, 240),
    registerLabel: line(value.registerLabel, 48),
    loginLabel: line(value.loginLabel, 48),
    nextLabel: line(value.nextLabel, 48),
    finishLabel: line(value.finishLabel, 48),
    categoryLabel: line(value.categoryLabel, 48),
    matchLabel: line(value.matchLabel ?? defaultLaunchFlow.matchLabel, 32),
    votesLabel: line(value.votesLabel ?? defaultLaunchFlow.votesLabel, 32),
    voteReminder: line(value.voteReminder ?? defaultLaunchFlow.voteReminder, 180),
    routeLabel: line(value.routeLabel ?? defaultLaunchFlow.routeLabel, 60),
    showSelfie: value.showSelfie !== false,
    categories: options(value.categories, true),
    apps: [...value.apps],
    schedule: value.schedule
      .map((item) => {
        if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(item.time))
          throw Error("Geçerli bir saat gir.");
        return { time: item.time, label: line(item.label, 55) };
      })
      .sort((a, b) => a.time.localeCompare(b.time)),
    questions: value.questions.map((q) => ({
      title: line(q.title, 90),
      label: line(q.label, 140),
      placeholder: line(q.placeholder, 160, true),
      options: options(q.options, false),
    })),
  };
}

export async function getLaunchFlow(): Promise<LaunchFlow> {
  const response = await fetch("/api/launch-admin", { cache: "no-store" });
  if (!response.ok) throw Error("Etkinlik akışı yüklenemedi.");
  return { ...defaultLaunchFlow, ...(await response.json()) };
}

export type PollQuestion = { id: string; title: string; options: string[] };
export type PollConfig = {
  revision: number;
  questionVersion: number;
  isOpen: boolean;
  publishedQuestion: number | null;
  questions: PollQuestion[];
};
export const novemberEventSlug = "14-kasim-2026";
export const novemberEventDraft = {
  slug: novemberEventSlug,
  title: "14 Kasım · notwork",
  shortTitle: "14 Kasım · notwork",
  startsAt: "2026-11-14T18:00:00+03:00",
  endsAt: "2026-11-14T23:59:00+03:00",
  timezone: "Europe/Istanbul",
  status: "scheduled" as const,
  location: { name: "Mekân belirlenecek", address: "", city: "", mapUrl: "" },
  entry: {
    isOpen: true,
    isPrimary: false,
    requireRegistration: true,
    appsTitle: "Şimdi notwork zamanı",
    appsSubtitle: "Tanış. Paylaş. Bağlantını büyüt.",
  },
  products: {
    matchlab: {
      enabled: true,
      visible: true,
      state: "ready" as const,
      dataMode: "demo" as const,
      label: "notwork match",
      order: 1,
    },
    wordcloud: {
      enabled: false,
      visible: false,
      state: "disabled" as const,
      dataMode: "demo" as const,
    },
    five: { enabled: false, visible: false, state: "disabled" as const, dataMode: "demo" as const },
  },
};
export const defaultPollQuestions: PollQuestion[] = [
  {
    id: "field",
    title: "Bugün hangi dünyadan geliyorsun?",
    options: ["Teknoloji", "Girişimcilik", "Tasarım ve sanat", "Pazarlama ve içerik", "Diğer"],
  },
  {
    id: "need",
    title: "Şu an en çok neye ihtiyacın var?",
    options: [
      "Yeni bağlantılar",
      "İş birliği",
      "Fikir ve geri bildirim",
      "Bilgi ve deneyim",
      "Ekip arkadaşı",
    ],
  },
  {
    id: "offer",
    title: "Topluluğa ne katabilirsin?",
    options: [
      "Teknik destek",
      "Yaratıcı fikirler",
      "İletişim ve pazarlama",
      "İş geliştirme",
      "Deneyim paylaşımı",
    ],
  },
  {
    id: "goal",
    title: "Bu buluşmadan neyle ayrılmak istersin?",
    options: [
      "Yeni bir arkadaş",
      "İş bağlantısı",
      "Proje ortağı",
      "İlham",
      "Somut bir sonraki adım",
    ],
  },
  {
    id: "word",
    title: "İyi bir bağlantının başlangıcı sence hangisi?",
    options: ["Merak", "Samimiyet", "Güven", "Ortak amaç", "Cesaret"],
  },
];
export type PollResult = {
  question: PollQuestion;
  total: number;
  counts: { label: string; count: number }[];
};
export type PollPayload = {
  config: PollConfig;
  submitted?: boolean;
  total: number;
  results?: PollResult[];
  published?: PollResult | null;
  database: { eventId: string; mode: string; keyPrefix: string };
};
export async function pollRequest(
  event: string,
  input: Record<string, unknown> = {},
): Promise<PollPayload> {
  const response = await fetch("/api/event-products/poll", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event, ...input }),
  });
  if (!response.ok) throw new Error((await response.text()) || "Anket yüklenemedi");
  return response.json();
}

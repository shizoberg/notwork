import type { EventNetworkRegistration, EventNetworkMatchGroup } from "./event-network";
const now = new Date().toISOString();
export const registration: EventNetworkRegistration = {
  profile: {
    id: "preview-person",
    username: "ornek-katilimci",
    firstName: "Örnek",
    lastName: "Katılımcı",
    email: "preview@example.invalid",
    emailNormalized: "preview@example.invalid",
    attendedEvent: "17-eylul-2026",
    generalNetworkOptIn: false,
    marketingOptIn: false,
    createdAt: now,
    updatedAt: now,
  },
  participant: {
    id: "preview-person",
    eventId: "preview",
    networkProfileId: "preview-person",
    publicCode: "C03",
    accessTokenHash: "",
    status: "registered",
    registeredAt: now,
    updatedAt: now,
  },
  offers: ["tasarım"],
  intro: "Yeni insanlarla tanışmak ve fikir alışverişi yapmak istiyorum.",
  offersDetail: "Ürün tasarımı ve fikirleri test etme konularında yardımcı olabilirim.",
  needs: "Yeni bir fikri hayata geçirmek için farklı bakış açıları arıyorum.",
  needTag: "fikir",
};
let round = Number(localStorage.getItem("notwork-match-preview-round")) || 1;
export function matchPreview() {
  const codes = round % 2 ? ["C03", "A12", "B07"] : ["C03", "D18", "E24"];
  const prompts = [
    "Son zamanlarda fikrini değiştiren bir şey neydi?",
    "Bugün birinden tek bir şey öğrenebilseydin ne olurdu?",
  ];
  const group: EventNetworkMatchGroup = {
    id: `preview-${round}`,
    groupSize: 3,
    round,
    score: 90,
    reason: "Farklı deneyimler, ortak merak.",
    generatedAt: now,
    photoOwnerParticipantId: "preview-person",
    conversationPrompt: prompts[0],
    conversationPrompts: prompts,
    members: codes.map((publicCode, index) => ({
      participantId: index ? `preview-${publicCode}` : "preview-person",
      publicCode,
      name: index ? `Örnek katılımcı ${index}` : "Sen",
      offers: ["tasarım"],
      needs: "Yeni bir fikri birlikte geliştirmek istiyorum.",
      needTag: "fikir",
      presence: "meeting",
      isCurrentUser: index === 0,
      isPhotoOwner: index === 0,
      isDone: false,
    })),
  };
  return { status: "ready" as const, registration, presence: "meeting" as const, group };
}
export function completePreview(input: {
  groupId?: string;
  skipReview?: boolean;
  comment: string;
  consent: boolean;
  photoDataUrl?: string;
}) {
  if (input.groupId !== `preview-${round}`) throw new Error("Grubun değişti. Ekranı yenile.");
  if (!input.skipReview && (!input.comment.trim() || !input.consent || !input.photoDataUrl))
    throw new Error("Yorum, fotoğraf ve yayın iznini tamamla veya doğrudan yeni gruba geç.");
  round++;
  localStorage.setItem("notwork-match-preview-round", String(round));
  return {
    ok: true as const,
    status: "completed" as const,
    registration,
    completedCount: 1,
    totalCount: 3,
  };
}

export type EventNetworkProfile = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailNormalized: string;
  attendedEvent: string;
  generalNetworkOptIn: boolean;
  marketingOptIn: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventParticipant = {
  id: string;
  eventId: string;
  networkProfileId: string;
  publicCode: string;
  accessTokenHash: string;
  status: "registered" | "excluded";
  registeredAt: string;
  updatedAt: string;
};

export type EventNetworkRegistration = {
  profile: EventNetworkProfile;
  participant: EventParticipant;
  offers: string[];
  intro: string;
  offersDetail: string;
  needs: string;
  needTag: string;
  accessToken?: string;
};

export const notworkEventOptions = [
  { value: "21-agustos-2026", label: "21 Ağustos 2026 · Rene Lokal" },
  { value: "14-temmuz-2026", label: "14 Temmuz 2026 · Mahall Bomonti" },
  { value: "22-mayis-2026", label: "22 Mayıs 2026 · İstinye Art İzmir" },
  { value: "10-nisan-2026", label: "10 Nisan 2026 · İstinye Art İzmir" },
  { value: "8-mart-2026", label: "8 Mart 2026 · İstinye Art İzmir" },
  { value: "10-subat-2026", label: "10 Şubat 2026 · İstinye Art İzmir" },
  { value: "16-ocak-2026", label: "16 Ocak 2026 · İstinye Art İzmir" },
  { value: "8-aralik-2025", label: "8 Aralık 2025 · İstinye Art İzmir" },
  { value: "ilk-etkinligim", label: "Bu ilk Notwork etkinliğim" },
] as const;

export type EventNetworkPresence = "open" | "meeting" | "paused";

export type EventNetworkMatchMember = {
  participantId: string;
  publicCode: string;
  name: string;
  offers: string[];
  needs: string;
  needTag: string;
  presence: EventNetworkPresence;
  isCurrentUser: boolean;
  isDone?: boolean;
  isPhotoOwner?: boolean;
};

export type EventNetworkMatchGroup = {
  id: string;
  groupSize: number;
  round: number;
  score: number;
  reason: string;
  members: EventNetworkMatchMember[];
  conversationPrompt: string;
  conversationPrompts?: string[];
  photoOwnerParticipantId?: string;
  generatedAt: string;
};

export type EventNetworkAdminPayload = {
  registrations: EventNetworkRegistration[];
  database?: {
    storeName: string;
    datasetCode: string;
    activeDatabaseCode: string;
    demoDatabaseCode: string;
    liveDatabaseCode: string;
    keyPrefix: string;
    mode: "demo" | "live";
  };
};

export function cleanEventNetworkText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

export function normalizeEventEmail(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

export function splitFullName(profile: Pick<EventNetworkProfile, "firstName" | "lastName">) {
  return `${profile.firstName} ${profile.lastName}`.replace(/\s+/g, " ").trim();
}

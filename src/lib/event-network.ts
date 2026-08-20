export type EventNetworkProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailNormalized: string;
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
  needs: string;
  needTag: string;
  accessToken?: string;
};

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

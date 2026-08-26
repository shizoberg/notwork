import {
  eventSelectionIdentifier,
  getEventSelectionFromLocation,
  type EventSelection,
  withEventSelectionInput,
} from "@/lib/event-registry";

export type FiveCategory =
  | "startup"
  | "marketing"
  | "product"
  | "career"
  | "finance"
  | "team"
  | "creative"
  | "community"
  | "other";

export type FiveMatchingProfile = {
  intro: string;
  offers: string[];
  offersDetail: string;
  needs: string;
  needTag: string;
};

export type FiveIdentity = {
  id: string;
  type: "member" | "event";
  name: string;
  firstName: string;
  username: string;
  email: string;
  publicCode: string;
  photoUrl: string;
  profileUrl: string;
  businessCardEnabled: boolean;
  matchingProfile: FiveMatchingProfile;
};

export type FiveProblem = {
  id: string;
  shortCode: string;
  eventId: string;
  ownerId: string;
  ownerName: string;
  ownerFirstName: string;
  ownerUsername: string;
  ownerPublicCode: string;
  ownerPhotoUrl: string;
  ownerProfileUrl: string;
  ownerBusinessCardEnabled: boolean;
  title: string;
  description: string;
  tried: string;
  desiredOutcome: string;
  category: FiveCategory;
  attending: boolean;
  source: "pre-event" | "live";
  status: "open" | "paused" | "closed";
  signals: string[];
  requestCount: number;
  conversationCount: number;
  consentAt: string;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  hasRequested: boolean;
  matchScore: number;
  matchReason: string;
};

export type FivePublicProblem = Pick<
  FiveProblem,
  | "id"
  | "shortCode"
  | "ownerFirstName"
  | "title"
  | "description"
  | "category"
  | "attending"
  | "signals"
  | "requestCount"
  | "createdAt"
>;

export type FiveHelpType = "direct" | "experience" | "referral" | "feedback";

export type FiveHelpRequest = {
  id: string;
  eventId: string;
  problemId: string;
  requesterId: string;
  requesterName: string;
  requesterUsername: string;
  requesterPublicCode: string;
  requesterPhotoUrl: string;
  requesterProfileUrl: string;
  requesterBusinessCardEnabled: boolean;
  helpType: FiveHelpType;
  pitch: string;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type FiveEncounterParticipant = Pick<
  FiveIdentity,
  "id" | "name" | "username" | "publicCode" | "photoUrl" | "profileUrl" | "businessCardEnabled"
>;

export type FiveChatMessage = {
  id: string;
  encounterId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderPublicCode: string;
  text: string;
  createdAt: string;
};

export type FiveEncounter = {
  id: string;
  eventId: string;
  problemId: string;
  problemTitle: string;
  owner: FiveEncounterParticipant;
  helpers: FiveEncounterParticipant[];
  requestIds: string[];
  status: "waiting" | "active" | "completed" | "cancelled";
  confirmations: string[];
  extensionVotes: string[];
  extensionUsed: boolean;
  startedAt: string;
  endsAt: string;
  outcome: "solution" | "next-step" | "referral" | "continue-later" | "not-fit" | "";
  createdAt: string;
  updatedAt: string;
  completedAt: string;
};

export type FivePublicPayload = {
  eventId: string;
  problems: FivePublicProblem[];
  stats: {
    total: number;
    attending: number;
    categories: Array<{ category: string; count: number }>;
  };
};

export type FiveSessionPayload = {
  identity: FiveIdentity;
  board: FiveProblem[];
  state: {
    identity: FiveIdentity;
    ownedProblems: Array<Omit<FiveProblem, "isOwner" | "hasRequested">>;
    incoming: FiveHelpRequest[];
    outgoing: FiveHelpRequest[];
    activeEncounter: FiveEncounter | null;
    activeEncounterMessages: FiveChatMessage[];
  };
  database: {
    storeName: string;
    datasetCode: string;
    eventId: string;
    prefix: string;
    activeDatabaseCode: string;
    demoDatabaseCode: string;
    liveDatabaseCode: string;
    keyPrefix: string;
    mode: "demo" | "live";
  };
};

export const fiveEventTokenStorageKey = "notwork_21_agustos_network_token";

export function getFiveEventTokenStorageKey(selection?: EventSelection) {
  const activeSelection = selection || getEventSelectionFromLocation();
  const identifier = eventSelectionIdentifier(activeSelection);
  return identifier ? `notwork_event_network_token:${identifier}` : fiveEventTokenStorageKey;
}

export const fiveCategories: Array<{ value: FiveCategory; label: string }> = [
  { value: "startup", label: "girişim" },
  { value: "marketing", label: "pazarlama" },
  { value: "product", label: "ürün & teknoloji" },
  { value: "career", label: "kariyer" },
  { value: "finance", label: "finans" },
  { value: "team", label: "ekip" },
  { value: "creative", label: "yaratıcı işler" },
  { value: "community", label: "topluluk" },
  { value: "other", label: "diğer" },
];

export const fiveHelpTypes: Array<{ value: FiveHelpType; label: string }> = [
  { value: "direct", label: "doğrudan çözebilirim" },
  { value: "experience", label: "benzerini yaşadım" },
  { value: "referral", label: "doğru kişiyi tanıyorum" },
  { value: "feedback", label: "yeni bir bakış sunabilirim" },
];

export function fiveCategoryLabel(value: string) {
  return fiveCategories.find((category) => category.value === value)?.label || "diğer";
}

export async function fiveRequest<T>(input?: Record<string, unknown>, selection?: EventSelection) {
  const activeSelection = selection || getEventSelectionFromLocation();
  const identifier = eventSelectionIdentifier(activeSelection);
  const endpoint = identifier
    ? `/api/event-products/five?event=${encodeURIComponent(identifier)}`
    : "/api/five";
  const response = await fetch(endpoint, {
    method: input ? "POST" : "GET",
    credentials: "include",
    headers: input ? { "content-type": "application/json" } : undefined,
    body: input ? JSON.stringify(withEventSelectionInput(input, activeSelection)) : undefined,
  });
  if (!response.ok) throw new Error((await response.text()) || "İşlem tamamlanamadı");
  return (await response.json()) as T;
}

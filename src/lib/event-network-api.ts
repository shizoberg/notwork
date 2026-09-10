import type {
  EventNetworkAdminPayload,
  EventNetworkMatchGroup,
  EventNetworkPresence,
  EventNetworkRegistration,
} from "@/lib/event-network";
import {
  eventSelectionIdentifier,
  getEventSelectionFromLocation,
  type EventSelection,
  withEventSelectionInput,
} from "@/lib/event-registry";

const legacyApiUrl = "/api/events/21-agustos/network";
export type EventChatMessage = {
  id: string;
  participantId: string;
  name: string;
  code: string;
  text: string;
  createdAt: string;
};
export async function eventChatRequest(
  accessToken: string,
  message?: string,
  messageId?: string,
): Promise<EventChatMessage[]> {
  if (import.meta.env.DEV && accessToken === "local-match-preview") {
    const key = "notwork-demo-event-chat";
    const rows: EventChatMessage[] = JSON.parse(localStorage.getItem(key) || "[]");
    if (message && !rows.some((row) => row.id === messageId))
      rows.push({
        id: messageId!,
        participantId: "preview-person",
        name: "Örnek Katılımcı",
        code: "C03",
        text: message,
        createdAt: new Date().toISOString(),
      });
    localStorage.setItem(key, JSON.stringify(rows.slice(-200)));
    return rows.slice(-200);
  }
  const selection = resolvedSelection();
  const response = await fetch(apiUrl(selection), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      withEventSelectionInput(
        { action: message ? "chatSend" : "chatRead", accessToken, message, messageId },
        selection,
      ),
    ),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
const legacyAdminUrl = "/api/admin/events/21-agustos/network";

function resolvedSelection(selection?: EventSelection) {
  return selection || getEventSelectionFromLocation();
}

function apiUrl(selection: EventSelection) {
  return eventSelectionIdentifier(selection) ? "/api/event-products/network" : legacyApiUrl;
}

function adminUrl(selection: EventSelection) {
  return eventSelectionIdentifier(selection) ? "/api/admin/event-products/network" : legacyAdminUrl;
}

export function getEventNetworkTokenStorageKey(selection?: EventSelection) {
  const identifier = eventSelectionIdentifier(resolvedSelection(selection));
  return identifier
    ? `notwork_event_network_token:${identifier}`
    : "notwork_21_agustos_network_token";
}

export async function registerEventNetwork(
  input: {
    firstName: string;
    lastName: string;
    email: string;
    offers: string[];
    intro?: string;
    offersDetail?: string;
    needs: string;
    needTag: string;
    attendedEvent?: string;
    generalNetworkOptIn: boolean;
    marketingOptIn: boolean;
    marketingPreferenceVersion?: string;
    eventConsent: boolean;
  },
  selection?: EventSelection,
) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(apiUrl(activeSelection), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      withEventSelectionInput({ action: "register", ...input }, activeSelection),
    ),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<EventNetworkRegistration>;
}

export async function getEventNetworkMe(accessToken: string, selection?: EventSelection) {
  if (import.meta.env.DEV && accessToken === "local-match-preview")
    return (await import("./match-preview")).registration;
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(apiUrl(activeSelection), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withEventSelectionInput({ action: "me", accessToken }, activeSelection)),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<EventNetworkRegistration>;
}

export async function resumeEventNetwork(selection?: EventSelection) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(apiUrl(activeSelection), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withEventSelectionInput({ action: "resume" }, activeSelection)),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<EventNetworkRegistration>;
}

export async function updateEventNetworkPresence(
  accessToken: string,
  presence: EventNetworkPresence,
  selection?: EventSelection,
) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(apiUrl(activeSelection), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      withEventSelectionInput({ action: "presence", accessToken, presence }, activeSelection),
    ),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{
    registration: EventNetworkRegistration;
    presence: EventNetworkPresence;
  }>;
}

export async function getEventNetworkMatch(accessToken: string, selection?: EventSelection) {
  if (import.meta.env.DEV && accessToken === "local-match-preview")
    return (await import("./match-preview")).matchPreview();
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(apiUrl(activeSelection), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      withEventSelectionInput({ action: "match", accessToken }, activeSelection),
    ),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{
    status: "ready" | "empty" | "paused";
    registration: EventNetworkRegistration;
    presence: EventNetworkPresence;
    group: EventNetworkMatchGroup | null;
  }>;
}

export async function completeEventNetworkMatch(accessToken: string, selection?: EventSelection) {
  return completeEventNetworkMatchWithReview(
    accessToken,
    {
      rating: 5,
      comment: "Match Lab görüşmesini tamamladım.",
      consent: true,
    },
    selection,
  );
}

export async function completeEventNetworkMatchWithReview(
  accessToken: string,
  review: {
    groupId?: string;
    skipReview?: boolean;
    rating: number;
    comment: string;
    photoDataUrl?: string;
    consent: boolean;
  },
  selection?: EventSelection,
) {
  if (import.meta.env.DEV && accessToken === "local-match-preview")
    return (await import("./match-preview")).completePreview(review);
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(apiUrl(activeSelection), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      withEventSelectionInput({ action: "completeMatch", accessToken, ...review }, activeSelection),
    ),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{
    ok: true;
    status: "waiting" | "completed";
    registration: EventNetworkRegistration;
    completedCount: number;
    totalCount: number;
  }>;
}

export async function seedEventNetworkSamples(selection?: EventSelection) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(apiUrl(activeSelection), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withEventSelectionInput({ action: "seedSamples" }, activeSelection)),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{ registrations: EventNetworkRegistration[] }>;
}

export async function getEventNetworkAdmin(password: string, selection?: EventSelection) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(adminUrl(activeSelection), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withEventSelectionInput({ password, action: "list" }, activeSelection)),
  });
  if (!response.ok) throw new Error("21 Ağustos network kayıtları alınamadı.");
  return response.json() as Promise<EventNetworkAdminPayload>;
}

export async function resetEventNetworkDemo(password: string, selection?: EventSelection) {
  const activeSelection = resolvedSelection(selection);
  const response = await fetch(adminUrl(activeSelection), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      withEventSelectionInput({ password, action: "resetDemo" }, activeSelection),
    ),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<EventNetworkAdminPayload>;
}

import type {
  EventNetworkAdminPayload,
  EventNetworkMatchGroup,
  EventNetworkPresence,
  EventNetworkRegistration,
} from "@/lib/event-network";

const apiUrl = "/api/events/21-agustos/network";
const adminUrl = "/api/admin/events/21-agustos/network";

export async function registerEventNetwork(input: {
  firstName: string;
  lastName: string;
  email: string;
  offers: string[];
  needs: string;
  needTag: string;
  generalNetworkOptIn: boolean;
  marketingOptIn: boolean;
  eventConsent: boolean;
}) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "register", ...input }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<EventNetworkRegistration>;
}

export async function getEventNetworkMe(accessToken: string) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "me", accessToken }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<EventNetworkRegistration>;
}

export async function updateEventNetworkPresence(
  accessToken: string,
  presence: EventNetworkPresence,
) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "presence", accessToken, presence }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{
    registration: EventNetworkRegistration;
    presence: EventNetworkPresence;
  }>;
}

export async function getEventNetworkMatch(accessToken: string) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "match", accessToken }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{
    status: "ready" | "empty" | "paused";
    registration: EventNetworkRegistration;
    presence: EventNetworkPresence;
    group: EventNetworkMatchGroup | null;
  }>;
}

export async function completeEventNetworkMatch(accessToken: string) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "completeMatch", accessToken }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{ ok: true; registration: EventNetworkRegistration }>;
}

export async function seedEventNetworkSamples() {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "seedSamples" }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{ registrations: EventNetworkRegistration[] }>;
}

export async function getEventNetworkAdmin(password: string) {
  const response = await fetch(adminUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, action: "list" }),
  });
  if (!response.ok) throw new Error("21 Ağustos network kayıtları alınamadı.");
  return response.json() as Promise<EventNetworkAdminPayload>;
}

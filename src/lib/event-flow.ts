import {
  eventSelectionIdentifier,
  withEventSelection,
  type EventProductKey,
  type EventSelection,
} from "./event-registry";

export type EventFlowStatus = "idle" | "running" | "awaiting_advance" | "completed";

export type EventFlowStep = {
  product: EventProductKey;
  label: string;
  durationMinutes: number;
};

export type EventFlowNotice = {
  id: string;
  text: string;
  createdAt: string;
};

export type EventFlowState = {
  version: 1;
  eventId: string;
  eventSlug: string;
  status: EventFlowStatus;
  steps: EventFlowStep[];
  currentStepIndex: number;
  startedAt: string;
  endsAt: string;
  notices: EventFlowNotice[];
  updatedAt: string;
  serverNow: string;
};

export const eventProductPaths: Record<EventProductKey, string> = {
  matchlab: "/21-agustos/eslesme",
  wordcloud: "/21-agustos/wordcloud",
  five: "/five/live",
};

export function currentEventFlowStep(flow: EventFlowState | null) {
  if (!flow || flow.currentStepIndex < 0) return null;
  return flow.steps[flow.currentStepIndex] || null;
}

export async function getEventFlow(selection: EventSelection = {}) {
  const response = await fetch(withEventSelection("/api/events/flow", selection), {
    cache: "no-store",
  });
  if (!response.ok) throw new Error((await response.text()) || "Etkinlik akışı alınamadı");
  return (await response.json()) as EventFlowState;
}

export async function updateEventFlow(
  password: string,
  selection: EventSelection,
  input: {
    action:
      | "get"
      | "configure"
      | "start"
      | "advance"
      | "complete"
      | "reset"
      | "addNotice"
      | "removeNotice";
    steps?: EventFlowStep[];
    notice?: string;
    noticeId?: string;
  },
) {
  const response = await fetch("/api/admin/events/flow", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      password,
      event: eventSelectionIdentifier(selection),
      ...input,
    }),
  });
  if (!response.ok) throw new Error((await response.text()) || "Etkinlik akışı güncellenemedi");
  return (await response.json()) as EventFlowState;
}

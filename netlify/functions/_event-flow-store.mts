import { randomUUID } from "node:crypto";
import type { EventFlowState, EventFlowStep } from "../../src/lib/event-flow.ts";
import { eventProductKeys, type EventProductKey } from "../../src/lib/event-registry.ts";
import { getEvent, getEventRegistryStore } from "./_event-registry-store.mjs";

const flowPrefix = "runtime";

function clean(value: unknown, max = 240) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";
}

function flowKey(eventId: string) {
  return `${flowPrefix}/${eventId}/flow-v1.json`;
}

function normalizeDuration(value: unknown) {
  return Math.max(1, Math.min(240, Math.round(Number(value) || 60)));
}

function defaultSteps(event: Awaited<ReturnType<typeof getEvent>>) {
  if (!event) return [];
  return eventProductKeys
    .filter((product) => event.products[product].enabled && event.products[product].visible)
    .sort((left, right) => event.products[left].order - event.products[right].order)
    .map((product) => ({
      product,
      label: event.products[product].label,
      durationMinutes: product === "five" ? 90 : 60,
    }));
}

function normalizeSteps(
  input: EventFlowStep[] | undefined,
  event: NonNullable<Awaited<ReturnType<typeof getEvent>>>,
) {
  const allowed = new Set(
    eventProductKeys.filter(
      (product) => event.products[product].enabled && event.products[product].visible,
    ),
  );
  const seen = new Set<EventProductKey>();
  return (input || [])
    .filter((step) => allowed.has(step.product) && !seen.has(step.product))
    .map((step) => {
      seen.add(step.product);
      return {
        product: step.product,
        label: clean(step.label, 60) || event.products[step.product].label,
        durationMinutes: normalizeDuration(step.durationMinutes),
      };
    });
}

function baseFlow(
  event: NonNullable<Awaited<ReturnType<typeof getEvent>>>,
): Omit<EventFlowState, "serverNow"> {
  return {
    version: 1,
    eventId: event.id,
    eventSlug: event.slug,
    status: "idle",
    steps: defaultSteps(event),
    currentStepIndex: -1,
    startedAt: "",
    endsAt: "",
    notices: [],
    updatedAt: new Date().toISOString(),
  };
}

function publicFlow(flow: Omit<EventFlowState, "serverNow">): EventFlowState {
  const now = new Date();
  const timedOut =
    flow.status === "running" && flow.endsAt && Date.parse(flow.endsAt) <= now.getTime();
  return {
    ...flow,
    status: timedOut ? "awaiting_advance" : flow.status,
    serverNow: now.toISOString(),
  };
}

export async function readEventFlow(identifier: string) {
  const event = await getEvent(identifier);
  if (!event) throw new Error("Etkinlik bulunamadı");
  const stored = (await getEventRegistryStore().get(flowKey(event.id), {
    type: "json",
    consistency: "strong",
  })) as Omit<EventFlowState, "serverNow"> | null;
  return publicFlow(stored?.version === 1 ? stored : baseFlow(event));
}

export async function mutateEventFlow(
  identifier: string,
  action: "configure" | "start" | "advance" | "complete" | "reset" | "addNotice" | "removeNotice",
  input: { steps?: EventFlowStep[]; notice?: string; noticeId?: string } = {},
) {
  const event = await getEvent(identifier);
  if (!event) throw new Error("Etkinlik bulunamadı");
  const store = getEventRegistryStore();
  const key = flowKey(event.id);
  const existing = (await store.get(key, {
    type: "json",
    consistency: "strong",
  })) as Omit<EventFlowState, "serverNow"> | null;
  const flow = existing?.version === 1 ? existing : baseFlow(event);
  const now = new Date();

  if (action === "configure") {
    if (["running", "awaiting_advance"].includes(publicFlow(flow).status))
      throw new Error("Çalışan akışın sırasını değiştirmeden önce akışı bitir");
    const steps = normalizeSteps(input.steps, event);
    if (!steps.length) throw new Error("Akışta en az bir uygulama olmalı");
    flow.steps = steps;
    flow.currentStepIndex = -1;
    flow.status = "idle";
    flow.startedAt = "";
    flow.endsAt = "";
  } else if (action === "start") {
    if (!flow.steps.length) throw new Error("Önce uygulama akışını kaydet");
    flow.currentStepIndex = 0;
    flow.status = "running";
    flow.startedAt = now.toISOString();
    flow.endsAt = new Date(now.getTime() + flow.steps[0].durationMinutes * 60_000).toISOString();
  } else if (action === "advance") {
    const nextIndex = flow.currentStepIndex + 1;
    if (nextIndex >= flow.steps.length) {
      flow.status = "completed";
      flow.currentStepIndex = flow.steps.length;
      flow.startedAt = "";
      flow.endsAt = "";
    } else {
      flow.currentStepIndex = nextIndex;
      flow.status = "running";
      flow.startedAt = now.toISOString();
      flow.endsAt = new Date(
        now.getTime() + flow.steps[nextIndex].durationMinutes * 60_000,
      ).toISOString();
    }
  } else if (action === "complete") {
    flow.status = "completed";
    flow.currentStepIndex = flow.steps.length;
    flow.startedAt = "";
    flow.endsAt = "";
  } else if (action === "reset") {
    flow.status = "idle";
    flow.currentStepIndex = -1;
    flow.startedAt = "";
    flow.endsAt = "";
  } else if (action === "addNotice") {
    const text = clean(input.notice, 220);
    if (!text) throw new Error("Bildirim metni gerekli");
    flow.notices = [
      ...flow.notices.slice(-9),
      { id: randomUUID(), text, createdAt: now.toISOString() },
    ];
  } else if (action === "removeNotice") {
    flow.notices = flow.notices.filter((notice) => notice.id !== input.noticeId);
  }

  flow.updatedAt = now.toISOString();
  await store.setJSON(key, flow);
  return publicFlow(flow);
}

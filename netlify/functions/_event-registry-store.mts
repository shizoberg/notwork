import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type {
  EventDataMode,
  EventLifecycleStatus,
  EventProductConfig,
  EventProductKey,
  EventProductState,
  EventRegistrationPrompts,
  NotworkEvent,
  NotworkEventLocation,
} from "../../src/lib/event-registry.ts";
import {
  defaultEventRegistrationPrompts,
  eventProductKeys,
  getEventProductNamespaces,
} from "../../src/lib/event-registry.ts";

export type EventDraft = Partial<
  Omit<
    NotworkEvent,
    | "schemaVersion"
    | "id"
    | "revision"
    | "createdAt"
    | "updatedAt"
    | "location"
    | "entry"
    | "products"
  >
> & {
  location?: Partial<NotworkEventLocation>;
  entry?: Partial<NotworkEvent["entry"]>;
  products?: Partial<Record<EventProductKey, Partial<EventProductConfig>>>;
  expectedRevision?: number;
};

const storeName = process.env.EVENT_REGISTRY_STORE?.trim() || "notwork-event-registry";
const eventsPrefix = "events";
const slugPrefix = "slugs";
const auditPrefix = "audit";
const primaryKey = "meta/primary-event.json";
const seededKey = "meta/legacy-seeded-v1.json";
const legacyEventId = "evt_21_agustos_2026";
const octoberEventId = "evt_9_ekim_2026";

const productLabels: Record<EventProductKey, string> = {
  matchlab: "ntw.matchlab",
  wordcloud: "ntw.wordcloud",
  five: "ntw.five",
};

const productOrders: Record<EventProductKey, number> = {
  five: 1,
  wordcloud: 2,
  matchlab: 3,
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

function slugify(value: unknown) {
  return clean(value, 100)
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function isIsoDate(value: string) {
  return Boolean(value) && !Number.isNaN(Date.parse(value));
}

function eventKey(eventId: string) {
  return `${eventsPrefix}/${eventId}.json`;
}

function slugKey(slug: string) {
  return `${slugPrefix}/${slug}.json`;
}

function defaultProduct(product: EventProductKey): EventProductConfig {
  return {
    enabled: false,
    visible: true,
    state: "disabled",
    dataMode: "demo",
    label: productLabels[product],
    order: productOrders[product],
  };
}

function normalizeProduct(
  product: EventProductKey,
  input?: Partial<EventProductConfig>,
  current?: EventProductConfig,
): EventProductConfig {
  const base = current || defaultProduct(product);
  const enabled = typeof input?.enabled === "boolean" ? input.enabled : base.enabled;
  const stateOptions: EventProductState[] = [
    "disabled",
    "draft",
    "ready",
    "live",
    "paused",
    "archived",
  ];
  const requestedState = clean(input?.state, 20) as EventProductState;
  const state = !enabled
    ? "disabled"
    : stateOptions.includes(requestedState)
      ? requestedState
      : base.state === "disabled"
        ? "draft"
        : base.state;
  const requestedMode = clean(input?.dataMode, 10) as EventDataMode;

  return {
    enabled,
    visible: typeof input?.visible === "boolean" ? input.visible : base.visible,
    state,
    dataMode: requestedMode === "live" ? "live" : requestedMode === "demo" ? "demo" : base.dataMode,
    label: clean(input?.label, 40) || base.label || productLabels[product],
    order: Math.max(1, Math.min(20, Number(input?.order) || base.order || productOrders[product])),
  };
}

function normalizeRegistrationPrompts(
  input?: Partial<EventRegistrationPrompts>,
  current?: EventRegistrationPrompts,
): EventRegistrationPrompts {
  const base = current || defaultEventRegistrationPrompts;
  return {
    introLabel: clean(input?.introLabel, 140) || base.introLabel,
    introPlaceholder: clean(input?.introPlaceholder, 280) || base.introPlaceholder,
    offersLabel: clean(input?.offersLabel, 140) || base.offersLabel,
    offersPlaceholder: clean(input?.offersPlaceholder, 280) || base.offersPlaceholder,
    needsLabel: clean(input?.needsLabel, 140) || base.needsLabel,
    needsPlaceholder: clean(input?.needsPlaceholder, 280) || base.needsPlaceholder,
  };
}

function normalizeProducts(
  input?: Partial<Record<EventProductKey, Partial<EventProductConfig>>>,
  current?: NotworkEvent["products"],
): NotworkEvent["products"] {
  return Object.fromEntries(
    eventProductKeys.map((product) => [
      product,
      normalizeProduct(product, input?.[product], current?.[product]),
    ]),
  ) as NotworkEvent["products"];
}

function normalizeLocation(
  input?: Partial<NotworkEventLocation>,
  current?: NotworkEventLocation,
): NotworkEventLocation {
  return {
    name: clean(input?.name, 120) || current?.name || "",
    address: clean(input?.address, 240) || current?.address || "",
    city: clean(input?.city, 80) || current?.city || "İzmir",
    mapUrl: clean(input?.mapUrl, 500) || current?.mapUrl || "",
  };
}

function normalizeStatus(value: unknown, fallback: EventLifecycleStatus) {
  const status = clean(value, 20) as EventLifecycleStatus;
  return ["draft", "scheduled", "live", "completed", "archived"].includes(status)
    ? status
    : fallback;
}

function normalizeEventDraft(input: EventDraft, current?: NotworkEvent) {
  const title = clean(input.title, 140) || current?.title || "";
  const slug = slugify(input.slug || current?.slug || title);
  const startsAt = clean(input.startsAt, 40) || current?.startsAt || "";
  const endsAt = clean(input.endsAt, 40) || current?.endsAt || "";

  if (!title) throw new Error("Etkinlik adı gerekli");
  if (!slug) throw new Error("Geçerli etkinlik URL adı gerekli");
  if (!isIsoDate(startsAt)) throw new Error("Geçerli etkinlik başlangıç tarihi gerekli");
  if (endsAt && !isIsoDate(endsAt)) throw new Error("Etkinlik bitiş tarihi geçersiz");
  if (endsAt && Date.parse(endsAt) < Date.parse(startsAt)) {
    throw new Error("Etkinlik bitiş tarihi başlangıçtan önce olamaz");
  }

  return {
    title,
    slug,
    shortTitle: clean(input.shortTitle, 80) || current?.shortTitle || title,
    startsAt: new Date(startsAt).toISOString(),
    endsAt: endsAt ? new Date(endsAt).toISOString() : "",
    timezone: clean(input.timezone, 80) || current?.timezone || "Europe/Istanbul",
    status: normalizeStatus(input.status, current?.status || "draft"),
    location: normalizeLocation(input.location, current?.location),
    entry: {
      isOpen:
        typeof input.entry?.isOpen === "boolean"
          ? input.entry.isOpen
          : current?.entry.isOpen || false,
      isPrimary: current?.entry.isPrimary || false,
      requireRegistration:
        typeof input.entry?.requireRegistration === "boolean"
          ? input.entry.requireRegistration
          : (current?.entry.requireRegistration ?? true),
      registrationPrompts: normalizeRegistrationPrompts(
        input.entry?.registrationPrompts,
        current?.entry.registrationPrompts,
      ),
    },
    products: normalizeProducts(input.products, current?.products),
  };
}

function legacyEvent(): NotworkEvent {
  const now = "2026-08-21T00:00:00.000Z";
  return {
    schemaVersion: 1,
    id: legacyEventId,
    slug: "21-agustos-2026",
    title: "21 Ağustos notwork",
    shortTitle: "21 Ağustos",
    startsAt: "2026-08-21T16:30:00.000Z",
    endsAt: "2026-08-21T20:30:00.000Z",
    timezone: "Europe/Istanbul",
    status: "completed",
    location: {
      name: "House of Rene Lokal",
      address: "Erzene Mahallesi Fevzi Çakmak Caddesi No: 49",
      city: "İzmir",
      mapUrl: "",
    },
    entry: {
      isOpen: false,
      isPrimary: true,
      requireRegistration: true,
      registrationPrompts: defaultEventRegistrationPrompts,
    },
    products: {
      matchlab: {
        enabled: true,
        visible: true,
        state: "archived",
        dataMode: "live",
        label: "ntw.matchlab",
        order: 3,
      },
      wordcloud: {
        enabled: true,
        visible: true,
        state: "archived",
        dataMode: "live",
        label: "ntw.wordcloud",
        order: 2,
      },
      five: {
        enabled: true,
        visible: true,
        state: "archived",
        dataMode: "live",
        label: "ntw.five",
        order: 1,
      },
    },
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
}

function octoberEvent(): NotworkEvent {
  const now = "2026-08-27T00:00:00.000Z";
  return {
    schemaVersion: 1,
    id: octoberEventId,
    slug: "9-ekim-2026",
    title: "9 Ekim notwork",
    shortTitle: "9 Ekim",
    startsAt: "2026-10-09T16:30:00.000Z",
    endsAt: "2026-10-09T19:30:00.000Z",
    timezone: "Europe/Istanbul",
    status: "draft",
    location: { name: "", address: "", city: "İzmir", mapUrl: "" },
    entry: {
      isOpen: false,
      isPrimary: false,
      requireRegistration: true,
      registrationPrompts: defaultEventRegistrationPrompts,
    },
    products: {
      matchlab: {
        enabled: true,
        visible: true,
        state: "draft",
        dataMode: "demo",
        label: "ntw.matchlab",
        order: 1,
      },
      five: {
        enabled: true,
        visible: true,
        state: "draft",
        dataMode: "demo",
        label: "ntw.five",
        order: 2,
      },
      wordcloud: {
        enabled: false,
        visible: false,
        state: "disabled",
        dataMode: "demo",
        label: "ntw.wordcloud",
        order: 3,
      },
    },
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
}

function hydrateEvent(event: NotworkEvent): NotworkEvent {
  const normalized = normalizeEventDraft(event, event);
  return {
    ...event,
    ...normalized,
    schemaVersion: 1,
    id: event.id,
    revision: event.revision || 1,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export function getEventRegistryStore() {
  return getStore({ name: storeName, consistency: "strong" });
}

export async function ensureEventRegistrySeeded() {
  const store = getEventRegistryStore();
  const seeded = await store.get(seededKey, { type: "json", consistency: "strong" });
  if (!seeded) {
    const event = legacyEvent();
    await Promise.all([
      store.setJSON(eventKey(event.id), event),
      store.setJSON(slugKey(event.slug), { eventId: event.id }),
      store.setJSON(primaryKey, { eventId: event.id }),
      store.setJSON(seededKey, { seededAt: new Date().toISOString(), eventId: event.id }),
    ]);
  }

  const existingOctoberEvent = await store.get(eventKey(octoberEventId), {
    type: "json",
    consistency: "strong",
  });
  if (!existingOctoberEvent) {
    const event = octoberEvent();
    await Promise.all([
      store.setJSON(eventKey(event.id), event),
      store.setJSON(slugKey(event.slug), { eventId: event.id }),
    ]);
  }
}

export async function listEvents() {
  await ensureEventRegistrySeeded();
  const store = getEventRegistryStore();
  const { blobs } = await store.list({ prefix: `${eventsPrefix}/` });
  const events = await Promise.all(
    blobs.map(
      (blob) =>
        store.get(blob.key, {
          type: "json",
          consistency: "strong",
        }) as Promise<NotworkEvent | null>,
    ),
  );
  return events
    .filter((event): event is NotworkEvent => Boolean(event?.id))
    .map(hydrateEvent)
    .sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt));
}

export async function getEvent(identifier: string) {
  await ensureEventRegistrySeeded();
  const store = getEventRegistryStore();
  const cleanIdentifier = clean(identifier, 100);
  if (!cleanIdentifier) return null;

  const direct = (await store.get(eventKey(cleanIdentifier), {
    type: "json",
    consistency: "strong",
  })) as NotworkEvent | null;
  if (direct) return hydrateEvent(direct);

  const pointer = (await store.get(slugKey(slugify(cleanIdentifier)), {
    type: "json",
    consistency: "strong",
  })) as { eventId?: string } | null;
  if (!pointer?.eventId) return null;
  const event = (await store.get(eventKey(pointer.eventId), {
    type: "json",
    consistency: "strong",
  })) as NotworkEvent | null;
  return event ? hydrateEvent(event) : null;
}

async function assertSlugAvailable(slug: string, currentEventId?: string) {
  const store = getEventRegistryStore();
  const pointer = (await store.get(slugKey(slug), {
    type: "json",
    consistency: "strong",
  })) as { eventId?: string } | null;
  if (pointer?.eventId && pointer.eventId !== currentEventId) {
    throw new Error("Bu etkinlik URL adı zaten kullanılıyor");
  }
}

export async function createEvent(input: EventDraft) {
  await ensureEventRegistrySeeded();
  const store = getEventRegistryStore();
  const normalized = normalizeEventDraft(input);
  await assertSlugAvailable(normalized.slug);
  const now = new Date().toISOString();
  const event: NotworkEvent = {
    schemaVersion: 1,
    id: `evt_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    ...normalized,
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };

  await Promise.all([
    store.setJSON(eventKey(event.id), event),
    store.setJSON(slugKey(event.slug), { eventId: event.id }),
    logEventRegistryAction("create", event.id, { slug: event.slug }),
  ]);
  return event;
}

export async function updateEvent(identifier: string, input: EventDraft) {
  const store = getEventRegistryStore();
  const current = await getEvent(identifier);
  if (!current) throw new Error("Etkinlik bulunamadı");
  if (typeof input.expectedRevision === "number" && input.expectedRevision !== current.revision) {
    throw new Error("Etkinlik başka bir oturumda güncellendi; sayfayı yenileyin");
  }

  const normalized = normalizeEventDraft(input, current);
  await assertSlugAvailable(normalized.slug, current.id);
  const event: NotworkEvent = {
    ...current,
    ...normalized,
    id: current.id,
    schemaVersion: 1,
    revision: current.revision + 1,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const writes: Array<Promise<unknown>> = [
    store.setJSON(eventKey(event.id), event),
    store.setJSON(slugKey(event.slug), { eventId: event.id }),
    logEventRegistryAction("update", event.id, { revision: event.revision }),
  ];
  if (current.slug !== event.slug) writes.push(store.delete(slugKey(current.slug)));
  await Promise.all(writes);
  return event;
}

export async function archiveEvent(identifier: string, expectedRevision?: number) {
  const current = await getEvent(identifier);
  if (!current) throw new Error("Etkinlik bulunamadı");
  if (current.entry.isPrimary) {
    throw new Error("Ana giriş etkinliği arşivlenmeden önce başka bir etkinliği ana giriş yapın");
  }
  return updateEvent(current.id, {
    expectedRevision,
    status: "archived",
    entry: { ...current.entry, isOpen: false },
    products: Object.fromEntries(
      eventProductKeys.map((product) => [
        product,
        { ...current.products[product], state: "archived" },
      ]),
    ),
  });
}

export async function setPrimaryEvent(identifier: string) {
  const store = getEventRegistryStore();
  const selected = await getEvent(identifier);
  if (!selected) throw new Error("Etkinlik bulunamadı");
  if (selected.status === "archived") throw new Error("Arşiv etkinliği ana giriş yapılamaz");

  const events = await listEvents();
  await Promise.all(
    events.map((event) => {
      const shouldBePrimary = event.id === selected.id;
      if (event.entry.isPrimary === shouldBePrimary) return Promise.resolve();
      return store.setJSON(eventKey(event.id), {
        ...event,
        entry: { ...event.entry, isPrimary: shouldBePrimary },
        revision: event.revision + 1,
        updatedAt: new Date().toISOString(),
      });
    }),
  );
  await Promise.all([
    store.setJSON(primaryKey, { eventId: selected.id }),
    logEventRegistryAction("setPrimary", selected.id, {}),
  ]);
  return getEvent(selected.id);
}

export async function getPrimaryEventId() {
  await ensureEventRegistrySeeded();
  const pointer = (await getEventRegistryStore().get(primaryKey, {
    type: "json",
    consistency: "strong",
  })) as { eventId?: string } | null;
  return pointer?.eventId || "";
}

export function getEventRegistryInfo(primaryEventId = "") {
  return { storeName, eventsPrefix, primaryEventId };
}

export function getEventNamespaces(event: NotworkEvent) {
  return getEventProductNamespaces(event);
}

export async function logEventRegistryAction(
  action: string,
  eventId: string,
  detail: Record<string, unknown>,
) {
  const now = new Date().toISOString();
  await getEventRegistryStore().setJSON(`${auditPrefix}/${Date.now()}-${randomUUID()}.json`, {
    action,
    eventId,
    detail,
    createdAt: now,
  });
}

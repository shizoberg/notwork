export const eventProductKeys = ["matchlab", "wordcloud", "five"] as const;

export type EventProductKey = (typeof eventProductKeys)[number];
export type EventDataMode = "demo" | "live";
export type EventLifecycleStatus = "draft" | "scheduled" | "live" | "completed" | "archived";
export type EventProductState = "disabled" | "draft" | "ready" | "live" | "paused" | "archived";

export type EventProductConfig = {
  enabled: boolean;
  visible: boolean;
  state: EventProductState;
  dataMode: EventDataMode;
  label: string;
};

export type NotworkEventLocation = {
  name: string;
  address: string;
  city: string;
  mapUrl: string;
};

export type NotworkEvent = {
  schemaVersion: 1;
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  status: EventLifecycleStatus;
  location: NotworkEventLocation;
  entry: {
    isOpen: boolean;
    isPrimary: boolean;
    requireRegistration: boolean;
  };
  products: Record<EventProductKey, EventProductConfig>;
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type EventProductNamespace = {
  eventId: string;
  eventSlug: string;
  product: EventProductKey;
  mode: EventDataMode;
  storeName: "event-network" | "event-wordcloud" | "ntw-five";
  keyPrefix: string;
};

export type EventRegistryInfo = {
  storeName: string;
  eventsPrefix: string;
  primaryEventId: string;
};

export type EventRegistryPayload = {
  events: NotworkEvent[];
  selectedEvent?: NotworkEvent;
  namespaces?: EventProductNamespace[];
  registry: EventRegistryInfo;
};

export type EventSelection = {
  event?: string;
  eventId?: string;
  eventSlug?: string;
};

export type PublicEventContext = {
  event: NotworkEvent;
  registry: EventRegistryInfo;
};

export type EventRegistryDraft = Partial<
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
};

export type EventRegistryAdminAction =
  | "list"
  | "get"
  | "create"
  | "update"
  | "archive"
  | "setPrimary";

export async function updateEventRegistry(
  password: string,
  input: {
    action?: EventRegistryAdminAction;
    eventId?: string;
    slug?: string;
    event?: EventRegistryDraft;
    expectedRevision?: number;
  } = {},
) {
  const response = await fetch("/api/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, ...input }),
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as EventRegistryPayload;
}

export function getEventSelectionFromLocation(): EventSelection {
  if (typeof window === "undefined") return {};
  const search = new URLSearchParams(window.location.search);
  const event = search.get("event")?.trim() || "";
  const eventId = search.get("eventId")?.trim() || "";
  const eventSlug = search.get("eventSlug")?.trim() || "";
  if (eventId) return { eventId };
  if (eventSlug) return { eventSlug };
  return event ? { event } : {};
}

export function eventSelectionIdentifier(selection: EventSelection = {}) {
  return selection.eventId?.trim() || selection.eventSlug?.trim() || selection.event?.trim() || "";
}

export function withEventSelection(path: string, selection: EventSelection = {}) {
  const identifier = eventSelectionIdentifier(selection);
  if (!identifier) return path;
  const [pathname, hash = ""] = path.split("#", 2);
  const separator = pathname.includes("?") ? "&" : "?";
  return `${pathname}${separator}event=${encodeURIComponent(identifier)}${hash ? `#${hash}` : ""}`;
}

export function withEventSelectionInput<T extends Record<string, unknown>>(
  input: T,
  selection: EventSelection = {},
) {
  const identifier = eventSelectionIdentifier(selection);
  return identifier ? { ...input, event: identifier } : input;
}

export async function getPublicEventContext(selection: EventSelection = {}) {
  const response = await fetch(withEventSelection("/api/events/context", selection), {
    cache: "no-store",
  });
  if (!response.ok) throw new Error((await response.text()) || "Etkinlik bilgisi alınamadı");
  return (await response.json()) as PublicEventContext;
}

const productStores: Record<EventProductKey, EventProductNamespace["storeName"]> = {
  matchlab: "event-network",
  wordcloud: "event-wordcloud",
  five: "ntw-five",
};

export function createEventProductNamespace(
  event: Pick<NotworkEvent, "id" | "slug">,
  product: EventProductKey,
  mode: EventDataMode,
): EventProductNamespace {
  return {
    eventId: event.id,
    eventSlug: event.slug,
    product,
    mode,
    storeName: productStores[product],
    keyPrefix: `events/${event.id}/${mode}/${product}`,
  };
}

export function getEventProductNamespaces(event: NotworkEvent) {
  return eventProductKeys.flatMap((product) => [
    createEventProductNamespace(event, product, "demo"),
    createEventProductNamespace(event, product, "live"),
  ]);
}

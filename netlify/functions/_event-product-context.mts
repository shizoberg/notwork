import { AsyncLocalStorage } from "node:async_hooks";

import type {
  EventDataMode,
  EventProductKey,
  EventProductNamespace,
  NotworkEvent,
} from "../../src/lib/event-registry.ts";
import { createEventProductNamespace } from "../../src/lib/event-registry.ts";
import { getEvent, getPrimaryEventId } from "./_event-registry-store.mjs";

type EventRequestContext = {
  event: NotworkEvent;
  requestedProduct: EventProductKey;
  modeOverride?: EventDataMode;
};

export type EventProductRuntimeContext = EventProductNamespace & {
  event: NotworkEvent;
  label: string;
  state: NotworkEvent["products"][EventProductKey]["state"];
  enabled: boolean;
  visible: boolean;
};

const requestContext = new AsyncLocalStorage<EventRequestContext>();

function cleanIdentifier(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 100) : "";
}

export function eventIdentifierFromRequest(
  request: Request,
  input?: { event?: unknown; eventId?: unknown; eventSlug?: unknown },
) {
  const url = new URL(request.url);
  return cleanIdentifier(
    input?.eventId ||
      input?.eventSlug ||
      input?.event ||
      url.searchParams.get("eventId") ||
      url.searchParams.get("eventSlug") ||
      url.searchParams.get("event"),
  );
}

export async function resolveEventRequestContext(
  identifier: string,
  product: EventProductKey,
  options: {
    allowDisabled?: boolean;
    allowHidden?: boolean;
    modeOverride?: EventDataMode;
  } = {},
) {
  const requestedIdentifier = identifier === "primary" ? await getPrimaryEventId() : identifier;
  const event = await getEvent(requestedIdentifier);
  if (!event) throw new Error("Etkinlik bulunamadı");

  const config = event.products[product];
  if (!options.allowDisabled && !config.enabled) {
    throw new Error(`${config.label} bu etkinlikte aktif değil`);
  }
  if (!options.allowHidden && !config.visible) {
    throw new Error(`${config.label} bu etkinlikte görünür değil`);
  }

  return {
    event,
    requestedProduct: product,
    modeOverride: options.modeOverride,
  } satisfies EventRequestContext;
}

export async function runWithEventRequestContext<T>(
  identifier: string,
  product: EventProductKey,
  callback: () => Promise<T>,
  options: {
    allowDisabled?: boolean;
    allowHidden?: boolean;
    modeOverride?: EventDataMode;
  } = {},
) {
  if (!identifier) return callback();
  const context = await resolveEventRequestContext(identifier, product, options);
  return requestContext.run(context, callback);
}

export function getEventProductRuntimeContext(
  product: EventProductKey,
): EventProductRuntimeContext | null {
  const context = requestContext.getStore();
  if (!context) return null;
  const config = context.event.products[product];
  const mode =
    context.requestedProduct === product && context.modeOverride
      ? context.modeOverride
      : config.dataMode;
  return {
    ...createEventProductNamespace(context.event, product, mode),
    event: context.event,
    label: config.label,
    state: config.state,
    enabled: config.enabled,
    visible: config.visible,
  };
}

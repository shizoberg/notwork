import { createHash, timingSafeEqual } from "node:crypto";
import type { Config, Context } from "@netlify/functions";
import {
  archiveEvent,
  createEvent,
  ensureEventRegistrySeeded,
  getEvent,
  getEventNamespaces,
  getEventRegistryInfo,
  getPrimaryEventId,
  listEvents,
  setPrimaryEvent,
  updateEvent,
  type EventDraft,
} from "./_event-registry-store.mjs";

type AdminInput = {
  password?: string;
  action?: "list" | "get" | "create" | "update" | "archive" | "setPrimary";
  eventId?: string;
  slug?: string;
  event?: EventDraft;
  expectedRevision?: number;
};

const fallbackPasswordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";

function validPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(process.env.ADMIN_PASSWORD_HASH || fallbackPasswordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function identifier(input: AdminInput) {
  return input.eventId?.trim() || input.slug?.trim() || "";
}

async function payload(selectedIdentifier = "") {
  const [events, primaryEventId] = await Promise.all([listEvents(), getPrimaryEventId()]);
  const selectedEvent = selectedIdentifier ? await getEvent(selectedIdentifier) : undefined;
  return {
    events,
    selectedEvent: selectedEvent || undefined,
    namespaces: selectedEvent ? getEventNamespaces(selectedEvent) : undefined,
    registry: getEventRegistryInfo(primaryEventId),
  };
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const input = (await request.json()) as AdminInput;
    if (!validPassword(input.password)) return new Response("Yetkisiz erişim", { status: 401 });
    await ensureEventRegistrySeeded();
    const action = input.action || "list";

    if (action === "list") {
      return Response.json(await payload(), {
        headers: { "cache-control": "no-store, private" },
      });
    }

    if (action === "get") {
      const selectedIdentifier = identifier(input);
      if (!selectedIdentifier) return new Response("Etkinlik seçimi gerekli", { status: 400 });
      const event = await getEvent(selectedIdentifier);
      if (!event) return new Response("Etkinlik bulunamadı", { status: 404 });
      return Response.json(await payload(event.id), {
        headers: { "cache-control": "no-store, private" },
      });
    }

    if (action === "create") {
      const event = await createEvent(input.event || {});
      return Response.json(await payload(event.id), {
        status: 201,
        headers: { "cache-control": "no-store, private" },
      });
    }

    if (action === "update") {
      const selectedIdentifier = identifier(input);
      if (!selectedIdentifier) return new Response("Etkinlik seçimi gerekli", { status: 400 });
      const event = await updateEvent(selectedIdentifier, {
        ...(input.event || {}),
        expectedRevision: input.expectedRevision ?? input.event?.expectedRevision,
      });
      return Response.json(await payload(event.id), {
        headers: { "cache-control": "no-store, private" },
      });
    }

    if (action === "archive") {
      const selectedIdentifier = identifier(input);
      if (!selectedIdentifier) return new Response("Etkinlik seçimi gerekli", { status: 400 });
      const event = await archiveEvent(selectedIdentifier, input.expectedRevision);
      return Response.json(await payload(event.id), {
        headers: { "cache-control": "no-store, private" },
      });
    }

    if (action === "setPrimary") {
      const selectedIdentifier = identifier(input);
      if (!selectedIdentifier) return new Response("Etkinlik seçimi gerekli", { status: 400 });
      const event = await setPrimaryEvent(selectedIdentifier);
      if (!event) return new Response("Etkinlik bulunamadı", { status: 404 });
      return Response.json(await payload(event.id), {
        headers: { "cache-control": "no-store, private" },
      });
    }

    return new Response("Geçersiz işlem", { status: 400 });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Etkinlik işlemi tamamlanamadı", {
      status: 400,
    });
  }
};

export const config: Config = { path: "/api/admin/events" };

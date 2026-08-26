import type { Config, Context } from "@netlify/functions";

import { getEvent, getEventRegistryInfo, getPrimaryEventId } from "./_event-registry-store.mjs";
import { eventIdentifierFromRequest } from "./_event-product-context.mjs";

export default async (request: Request, _context: Context) => {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  try {
    const requestedIdentifier = eventIdentifierFromRequest(request);
    const primaryEventId = await getPrimaryEventId();
    const event = await getEvent(requestedIdentifier || primaryEventId);
    if (!event) return new Response("Etkinlik bulunamadı", { status: 404 });

    return Response.json(
      { event, registry: getEventRegistryInfo(primaryEventId) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Etkinlik bilgisi alınamadı", {
      status: 400,
    });
  }
};

export const config: Config = { path: "/api/events/context" };

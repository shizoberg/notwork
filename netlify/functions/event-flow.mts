import type { Config, Context } from "@netlify/functions";
import { getPrimaryEventId } from "./_event-registry-store.mjs";
import { eventIdentifierFromRequest } from "./_event-product-context.mjs";
import { readEventFlow } from "./_event-flow-store.mjs";

export default async (request: Request, _context: Context) => {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
  try {
    const identifier = eventIdentifierFromRequest(request) || (await getPrimaryEventId());
    return Response.json(await readEventFlow(identifier), {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Etkinlik akışı alınamadı", {
      status: 400,
    });
  }
};

export const config: Config = { path: "/api/events/flow" };

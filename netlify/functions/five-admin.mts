import { createHash, timingSafeEqual } from "node:crypto";
import type { Config, Context } from "@netlify/functions";

import {
  getFiveAdminSnapshot,
  getFiveDatasetInfo,
  getFiveStore,
  resetFiveDemoData,
  seedFiveDemoData,
} from "./_five-store.mjs";
import {
  eventIdentifierFromRequest,
  getEventProductRuntimeContext,
  runWithEventRequestContext,
} from "./_event-product-context.mjs";

const passwordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";

function validPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(passwordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const input = (await request.json()) as {
      password?: string;
      action?: string;
      event?: string;
      eventId?: string;
      eventSlug?: string;
      mode?: "demo" | "live";
    };
    if (!validPassword(input.password)) return new Response("Yetkisiz erişim", { status: 401 });
    const eventIdentifier = eventIdentifierFromRequest(request, input);
    return runWithEventRequestContext(
      eventIdentifier,
      "five",
      async () => {
        const store = getFiveStore();
        const database = getFiveDatasetInfo();
        const runtime = getEventProductRuntimeContext("five");
        if (input.action === "resetDemo") await resetFiveDemoData(store);
        if (
          input.action === "seedDemo" ||
          (input.action !== "resetDemo" && database.mode === "demo" && runtime?.enabled)
        ) {
          await seedFiveDemoData(store);
        }
        return Response.json(await getFiveAdminSnapshot(store), {
          headers: { "cache-control": "no-store, private" },
        });
      },
      { allowDisabled: true, allowHidden: true, modeOverride: input.mode },
    );
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "ntw.five verisi alınamadı", {
      status: 400,
    });
  }
};

export const config: Config = { path: "/api/admin/event-products/five" };

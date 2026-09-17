import { createHash, timingSafeEqual } from "node:crypto";
import type { Config, Context } from "@netlify/functions";
import type { EventFlowStep } from "../../src/lib/event-flow.ts";
import { mutateEventFlow, readEventFlow } from "./_event-flow-store.mjs";

type AdminInput = {
  password?: string;
  event?: string;
  action?:
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
};

const fallbackPasswordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";

function validPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(process.env.ADMIN_PASSWORD_HASH || fallbackPasswordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const input = (await request.json()) as AdminInput;
    if (!validPassword(input.password)) return new Response("Yetkisiz erişim", { status: 401 });
    if (!input.event?.trim()) return new Response("Etkinlik seçimi gerekli", { status: 400 });
    const action = input.action || "get";
    const flow =
      action === "get"
        ? await readEventFlow(input.event)
        : await mutateEventFlow(input.event, action, input);
    return Response.json(flow, { headers: { "cache-control": "no-store, private" } });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Etkinlik akışı güncellenemedi", {
      status: 400,
    });
  }
};

export const config: Config = { path: "/api/admin/events/flow" };

import { createHash, timingSafeEqual } from "node:crypto";
import type { Config, Context } from "@netlify/functions";
import {
  getEventNetworkDatasetInfo,
  getEventNetworkStore,
  listRegistrations,
  resetDemoEventNetworkDataset,
  type NetworkAdminInput,
} from "./_event-network-store.mjs";

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
    const input = (await request.json()) as NetworkAdminInput;
    if (!validPassword(input.password)) return new Response("Yetkisiz erişim", { status: 401 });
    const store = getEventNetworkStore();
    if (input.action === "resetDemo") {
      await resetDemoEventNetworkDataset(store);
    }
    return Response.json(
      { registrations: await listRegistrations(store), database: getEventNetworkDatasetInfo() },
      { headers: { "cache-control": "no-store, private" } },
    );
  } catch {
    return new Response("Kayıtlar alınamadı", { status: 500 });
  }
};

export const config: Config = { path: "/api/admin/events/21-agustos/network" };

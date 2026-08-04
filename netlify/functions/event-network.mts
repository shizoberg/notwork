import type { Config, Context } from "@netlify/functions";
import { readFile } from "node:fs/promises";
import {
  clean,
  getEventNetworkStore,
  getNextMatchGroup,
  getRegistrationByToken,
  registerNetworkProfile,
  seedSampleRegistrations,
  updatePresenceByToken,
  type NetworkInput,
} from "./_event-network-store.mjs";

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: { "cache-control": "no-store", ...(init?.headers || {}) },
  });
}

function isLocalRequest(request: Request) {
  const url = new URL(request.url);
  return (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    process.env.NETLIFY_DEV === "true"
  );
}

function isDemoSeedAllowed(request: Request) {
  return isLocalRequest(request) || process.env.DISABLE_EVENT_DEMO_SEED !== "true";
}

async function readSampleData() {
  const fileUrl = new URL("../data/21-agustos-network-sample.json", import.meta.url);
  return JSON.parse(await readFile(fileUrl, "utf8")) as Array<{
    firstName: string;
    lastName: string;
    email: string;
    offers: string[];
    needs: string;
    needTag: string;
  }>;
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (Number(request.headers.get("content-length") || 0) > 8_192) {
    return new Response("Payload too large", { status: 413 });
  }

  try {
    const input = (await request.json()) as NetworkInput;
    const action = clean(input.action, 30);
    const store = getEventNetworkStore();

    if (action === "register") {
      return json(await registerNetworkProfile(store, input), { status: 201 });
    }

    if (action === "me") {
      const registration = await getRegistrationByToken(store, clean(input.accessToken, 100));
      if (!registration) return new Response("Kayıt bulunamadı", { status: 404 });
      return json(registration);
    }

    if (action === "presence") {
      const result = await updatePresenceByToken(
        store,
        clean(input.accessToken, 100),
        input.presence || "open",
      );
      if (!result) return new Response("Kayıt bulunamadı", { status: 404 });
      return json(result);
    }

    if (action === "match") {
      const result = await getNextMatchGroup(store, clean(input.accessToken, 100));
      if (!result) return new Response("Kayıt bulunamadı", { status: 404 });
      return json(result);
    }

    if (action === "seedSamples") {
      if (!isDemoSeedAllowed(request))
        return new Response("Demo seed şu anda kapalı", { status: 403 });
      const registrations = await seedSampleRegistrations(store, await readSampleData());
      return json({ registrations }, { status: 201 });
    }

    return new Response("Geçersiz işlem", { status: 400 });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Kayıt alınamadı", {
      status: 400,
    });
  }
};

export const config: Config = { path: "/api/events/21-agustos/network" };

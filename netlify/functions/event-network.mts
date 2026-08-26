import type { Config, Context } from "@netlify/functions";
import { readFile } from "node:fs/promises";
import {
  clean,
  completeActiveMatchByToken,
  getEventNetworkDatasetInfo,
  getEventNetworkStore,
  getNextMatchGroup,
  getRegistrationByToken,
  registerNetworkProfile,
  resumeNetworkProfile,
  resetDemoEventNetworkDataset,
  seedSampleRegistrations,
  updatePresenceByToken,
  type NetworkInput,
} from "./_event-network-store.mjs";
import {
  eventIdentifierFromRequest,
  runWithEventRequestContext,
} from "./_event-product-context.mjs";
import {
  activateEventAttendeeMember,
  getMemberProfileBySession,
} from "./_member-profile-store.mjs";

const memberSessionCookieName = "notwork_profile_session";

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

function readMemberSessionCookie(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const row = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${memberSessionCookieName}=`));
  return row ? decodeURIComponent(row.slice(memberSessionCookieName.length + 1)) : "";
}

function validOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
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
  if (!validOrigin(request)) return new Response("Geçersiz istek kaynağı", { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 1_400_000) {
    return new Response("Payload too large", { status: 413 });
  }

  try {
    const input = (await request.json()) as NetworkInput;
    const eventIdentifier = eventIdentifierFromRequest(request, input);
    return await runWithEventRequestContext(eventIdentifier, "matchlab", async () => {
      const action = clean(input.action, 30);
      const store = getEventNetworkStore();
      const memberSession = await getMemberProfileBySession(readMemberSessionCookie(request));

      if (action === "register") {
        if (
          memberSession &&
          clean(input.email, 120).toLocaleLowerCase("tr-TR") !== memberSession.profile.email
        ) {
          return new Response("Açık profil oturumundaki e-posta ile devam etmelisin", {
            status: 403,
          });
        }
        const registration = await registerNetworkProfile(store, {
          ...input,
          memberUsername: memberSession?.profile.username || input.memberUsername,
        });
        const membership = await activateEventAttendeeMember(registration);
        return json({ ...registration, membership }, { status: 201 });
      }

      if (action === "resume") {
        if (!memberSession) return new Response("Profil oturumu bulunamadı", { status: 401 });
        const registration = await resumeNetworkProfile(
          store,
          memberSession.profile.email,
          memberSession.profile.username,
        );
        if (!registration)
          return new Response("Bu etkinlik için kayıt bulunamadı", { status: 404 });
        return json(registration);
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

      if (action === "completeMatch") {
        const result = await completeActiveMatchByToken(
          store,
          clean(input.accessToken, 100),
          input,
        );
        if (!result) return new Response("Kayıt bulunamadı", { status: 404 });
        return json(result);
      }

      if (action === "seedSamples") {
        if (!isDemoSeedAllowed(request))
          return new Response("Demo seed şu anda kapalı", { status: 403 });
        if (getEventNetworkDatasetInfo().mode !== "demo")
          return new Response("Seed sadece demo database üzerinde çalışır", { status: 403 });
        await resetDemoEventNetworkDataset(store);
        const registrations = await seedSampleRegistrations(store, await readSampleData());
        return json({ registrations }, { status: 201 });
      }

      return new Response("Geçersiz işlem", { status: 400 });
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Kayıt alınamadı", {
      status: 400,
    });
  }
};

export const config: Config = {
  path: ["/api/events/21-agustos/network", "/api/event-products/network"],
};

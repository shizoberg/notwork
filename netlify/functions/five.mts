import type { Config, Context } from "@netlify/functions";

import {
  eventIdentifierFromRequest,
  runWithEventRequestContext,
} from "./_event-product-context.mjs";
import { getEventNetworkStore, getRegistrationByToken } from "./_event-network-store.mjs";
import {
  acceptFiveHelpRequest,
  cleanFiveText,
  completeFiveEncounter,
  confirmFiveEncounter,
  createFiveDemoEncounter,
  createFiveHelpRequest,
  createFiveProblem,
  getFiveDatasetInfo,
  getFiveLiveBoard,
  getFiveMyState,
  getFivePublicBoard,
  getFiveStore,
  sendFiveChatMessage,
  syncFiveProblemsForIdentity,
  voteFiveExtension,
  type FiveCategory,
  type FiveEncounter,
  type FiveHelpType,
  type FiveIdentity,
} from "./_five-store.mjs";
import { getMemberFiveSummary, getMemberProfileBySession } from "./_member-profile-store.mjs";

const memberSessionCookieName = "notwork_profile_session";

type FiveInput = {
  action?: string;
  event?: string;
  eventId?: string;
  eventSlug?: string;
  accessToken?: string;
  website?: string;
  name?: string;
  email?: string;
  title?: string;
  description?: string;
  tried?: string;
  desiredOutcome?: string;
  category?: FiveCategory;
  attending?: boolean;
  consent?: boolean;
  problemId?: string;
  requestId?: string;
  helpType?: FiveHelpType;
  pitch?: string;
  message?: string;
  outcome?: FiveEncounter["outcome"];
};

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: { "cache-control": "no-store", ...(init?.headers || {}) },
  });
}

function validOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function isLocalRequest(request: Request) {
  const hostname = new URL(request.url).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function readMemberSessionCookie(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const row = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${memberSessionCookieName}=`));
  return row ? decodeURIComponent(row.slice(memberSessionCookieName.length + 1)) : "";
}

function memberIdentity(profile: Awaited<ReturnType<typeof getMemberProfileBySession>>) {
  if (!profile) return null;
  const latestEventCode = [...profile.profile.eventCodes]
    .sort((first, second) => second.issuedAt.localeCompare(first.issuedAt))
    .at(0)?.code;
  return {
    id: `member:${profile.profile.username}`,
    type: "member",
    name: profile.profile.name,
    firstName: profile.profile.name.split(" ")[0] || "katılımcı",
    username: profile.profile.username,
    email: profile.profile.email,
    publicCode: latestEventCode || "NTW",
    photoUrl: profile.profile.photoUrl
      ? `/api/member-profile?networkPhoto=${encodeURIComponent(profile.profile.username)}&v=${encodeURIComponent(profile.profile.updatedAt)}`
      : "",
    profileUrl: `/u/${encodeURIComponent(profile.profile.username)}`,
    businessCardEnabled:
      profile.profile.status === "active" &&
      !profile.profile.mustChangePassword &&
      profile.profile.publicProfileEnabled,
  } satisfies FiveIdentity;
}

async function resolveIdentity(request: Request, input: FiveInput) {
  const member = memberIdentity(await getMemberProfileBySession(readMemberSessionCookie(request)));
  if (member) return member;

  const accessToken = cleanFiveText(input.accessToken, 120);
  if (!accessToken) return null;
  const registration = await getRegistrationByToken(getEventNetworkStore(), accessToken);
  if (!registration) return null;
  const memberSummary = await getMemberFiveSummary(
    registration.profile.username ||
      registration.profile.emailNormalized ||
      registration.profile.email,
  );
  return {
    id: `event:${registration.participant.id}`,
    type: "event",
    name: `${registration.profile.firstName} ${registration.profile.lastName}`.trim(),
    firstName: registration.profile.firstName,
    username: memberSummary?.username || registration.profile.username,
    email: registration.profile.emailNormalized || registration.profile.email,
    publicCode: registration.participant.publicCode,
    photoUrl: memberSummary?.photoUrl || "",
    profileUrl:
      memberSummary?.profileUrl ||
      (registration.profile.username
        ? `/u/${encodeURIComponent(registration.profile.username)}`
        : ""),
    businessCardEnabled: Boolean(memberSummary?.businessCardEnabled),
  } satisfies FiveIdentity;
}

async function fiveSession(identity: FiveIdentity) {
  const store = getFiveStore();
  await syncFiveProblemsForIdentity(identity, store);
  const [board, state] = await Promise.all([
    getFiveLiveBoard(identity, store),
    getFiveMyState(identity, store),
  ]);
  return { identity, board, state, database: getFiveDatasetInfo() };
}

export default async (request: Request, _context: Context) => {
  if (!validOrigin(request)) return new Response("Geçersiz istek kaynağı", { status: 403 });

  if (request.method === "GET") {
    const eventIdentifier = eventIdentifierFromRequest(request);
    return runWithEventRequestContext(eventIdentifier, "five", async () =>
      json({ ...(await getFivePublicBoard()), database: getFiveDatasetInfo() }),
    );
  }

  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (Number(request.headers.get("content-length") || 0) > 24_000) {
    return new Response("Payload too large", { status: 413 });
  }

  try {
    const input = (await request.json()) as FiveInput;
    const eventIdentifier = eventIdentifierFromRequest(request, input);
    return await runWithEventRequestContext(eventIdentifier, "five", async () => {
      const action = cleanFiveText(input.action, 30);

      if (action === "submitPublic") {
        if (cleanFiveText(input.website, 120)) return json({ ok: true }, { status: 201 });
        const problem = await createFiveProblem({ ...input, source: "pre-event" });
        return json({ problem: { id: problem.id, shortCode: problem.shortCode } }, { status: 201 });
      }

      const identity = await resolveIdentity(request, input);
      if (!identity)
        return new Response("Notwork oturumu veya etkinlik kaydı gerekli", { status: 401 });

      if (action === "session" || action === "state") return json(await fiveSession(identity));

      if (action === "submitLive") {
        await createFiveProblem({ ...input, source: "live" }, identity);
        return json(await fiveSession(identity), { status: 201 });
      }

      if (action === "help") {
        await createFiveHelpRequest(identity, input);
        return json(await fiveSession(identity), { status: 201 });
      }

      if (action === "accept") {
        await acceptFiveHelpRequest(identity, cleanFiveText(input.requestId, 80));
        return json(await fiveSession(identity));
      }

      if (action === "confirm") {
        await confirmFiveEncounter(identity);
        return json(await fiveSession(identity));
      }

      if (action === "extend") {
        await voteFiveExtension(identity);
        return json(await fiveSession(identity));
      }

      if (action === "complete") {
        await completeFiveEncounter(identity, input.outcome || "");
        return json(await fiveSession(identity));
      }

      if (action === "message") {
        await sendFiveChatMessage(identity, input.message);
        return json(await fiveSession(identity), { status: 201 });
      }

      if (action === "demoEncounter" && isLocalRequest(request)) {
        await createFiveDemoEncounter(identity);
        return json(await fiveSession(identity), { status: 201 });
      }

      return new Response("Geçersiz işlem", { status: 400 });
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "İşlem tamamlanamadı", {
      status: 400,
    });
  }
};

export const config: Config = { path: ["/api/five", "/api/event-products/five"] };

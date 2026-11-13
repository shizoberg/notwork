import type { Config, Context } from "@netlify/functions";
import { readFile } from "node:fs/promises";
import {
  clean,
  saveLaunchGroupSelfie,
  launchSpacePeople,
  launchProfilePhoto,
  requestLaunchSignIn,
  completeLaunchSignIn,
  normalizeEmail,
  hashToken,
  launchIntroductionReason,
  eventChat,
  completeActiveMatchByToken,
  rateActiveMatch,
  getEventNetworkDatasetInfo,
  getEventNetworkStore,
  getNextMatchGroup,
  getRegistrationByToken,
  registerNetworkProfile,
  rotateActiveMatchByToken,
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
      const database = getEventNetworkDatasetInfo();
      if (input.datasetId && input.datasetId !== database.datasetId)
        return new Response("Veri seti değişti. Sayfayı yenile.", { status: 409 });
      const launchDemo = database.eventSlug === "14-kasim-2026" && database.mode === "demo";
      const launchOnly =
        launchDemo ||
        (database.eventSlug === "14-kasim-2026" &&
          database.datasetId &&
          !database.datasetId.startsWith("legacy-"));
      const action = clean(input.action, 30);
      const store = getEventNetworkStore();
      // Matching/chat authenticate with the event token; only registration/resume need the profile cookie.
      const memberSession =
        action === "register" || action === "resume"
          ? await getMemberProfileBySession(readMemberSessionCookie(request))
          : null;

      if (action === "launchSignIn" || action === "launchSignInComplete") {
        if (database.eventSlug !== "14-kasim-2026") return new Response("Geçersiz etkinlik", { status: 403 });
        if (action === "launchSignIn") {
          await requestLaunchSignIn(store, clean(input.email, 120));
          return json({ ok: true });
        }
        const registration = await completeLaunchSignIn(store, clean(input.accessToken, 100));
        return registration ? json(registration) : new Response("Bağlantı geçersiz veya süresi dolmuş.", { status: 401 });
      }
      if (action === "launchProfilePhoto") {
        if (database.eventSlug !== "14-kasim-2026")
          return new Response("Bu alan etkinliğe özel", { status: 403 });
        return json(await launchProfilePhoto(store, input, clean((input as NetworkInput & { targetId?: string }).targetId, 100) || undefined));
      }
      if (action === "launchGuest" || action === "groupSelfie") {
        if (database.eventSlug !== "14-kasim-2026")
          return new Response("Bu işlem Launchspace’e özel", { status: 403 });
        if (action === "groupSelfie") {
          await saveLaunchGroupSelfie(store, input);
          return json({ ok: true });
        }
        const name = clean(input.firstName, 100);
        if (!name || input.eventConsent !== true)
          return new Response("İsim ve etkinlik onayı gerekli", { status: 400 });
        const contactEmail = clean(input.email, 120);
        const indexKey = `${database.keyPrefix}/guest-email-index/${hashToken(normalizeEmail(contactEmail))}.json`;
        if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
          return new Response("Geçerli bir e-posta adresi yaz.", { status: 400 });
        if (contactEmail && await store.get(indexKey, { consistency: "strong" }))
          return new Response("Bu e-postayla etkinlik kaydı var. Kaydım var seçeneğinden giriş bağlantısı iste.", { status: 409 });
        const [firstName, ...rest] = name.split(/\s+/);
        const registration = await registerNetworkProfile(store, {
          firstName,
          lastName: rest.join(" "),
          email: `guest-${crypto.randomUUID()}@launchspace.invalid`,
          offers: input.offers?.length ? input.offers : ["networking"],
          intro: input.intro,
          offersDetail: input.offersDetail,
          needs: input.needs,
          aiAnalysisConsent: input.aiAnalysisConsent === true,
          needTag: "networking",
          attendedEvent: database.eventSlug,
          eventConsent: true,
        }, { allowSingleName: true });
        if (contactEmail) {
          await store.setJSON(`${database.keyPrefix}/guest-contacts/${registration.participant.id}.json`, { email: contactEmail });
          await store.setJSON(
            indexKey,
            { id: registration.participant.id }, { onlyIfNew: true },
          );
        }
        return json(registration, { status: 201 });
      }

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
          ...(launchOnly
            ? {
                marketingPreferenceVersion: undefined,
                marketingOptIn: false,
                generalNetworkOptIn: false,
                modelImprovementConsent: false,
              }
            : {}),
        });
        const membership = launchOnly ? undefined : await activateEventAttendeeMember(registration);
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

      if (action === "rateMatch") {
        const saved = await rateActiveMatch(store, clean(input.accessToken, 100), input);
        return saved ? json({ ok: true }) : new Response("Aktif grup bulunamadı", { status: 403 });
      }

      if (action === "me") {
        const registration = await getRegistrationByToken(store, clean(input.accessToken, 100));
        if (!registration) return new Response("Kayıt bulunamadı", { status: 404 });
        return json(registration);
      }

      if (action === "introductionReason") {
        if (database.eventSlug !== "14-kasim-2026")
          return new Response("Bu alan etkinliğe özel", { status: 403 });
        const reason = await launchIntroductionReason(
          store, clean(input.accessToken, 100),
          clean((input as NetworkInput & { targetId?: string }).targetId, 100),
        );
        return json({ reason });
      }

      if (action === "people" || action === "introduce") {
        if (database.eventSlug !== "14-kasim-2026")
          return new Response("Bu alan etkinliğe özel", { status: 403 });
        if (
          action === "introduce" &&
          !clean((input as NetworkInput & { targetId?: string }).targetId, 100)
        )
          return new Response("Kişi seçmelisin", { status: 400 });
        return json(
          await launchSpacePeople(
            store,
            clean(input.accessToken, 100),
            action === "introduce"
              ? clean((input as NetworkInput & { targetId?: string }).targetId, 100)
              : undefined,
            action === "introduce" ? input : undefined,
          ),
        );
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

      if (action === "chatRead" || action === "chatSend")
        return json(await eventChat(store, clean(input.accessToken, 100), input));

      if (action === "completeMatch") {
        const result = await completeActiveMatchByToken(
          store,
          clean(input.accessToken, 100),
          input,
        );
        if (!result) return new Response("Kayıt bulunamadı", { status: 404 });
        return json(result);
      }

      if (action === "rotateMatch") {
        return json(
          await rotateActiveMatchByToken(
            store,
            clean(input.accessToken, 100),
            clean(input.groupId, 100),
          ),
        );
      }

      if (action === "seedSamples") {
        // Public demo access must never authorize resetting the hosted event dataset.
        if (database.eventSlug === "14-kasim-2026" && !isLocalRequest(request))
          return new Response("Canlı etkinlik demosu buradan sıfırlanamaz", { status: 403 });
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
